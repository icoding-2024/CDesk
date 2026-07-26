$(document).ready(function () {
  // Replace this with your Web App URL after re-deploying Google Apps Script
  const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxkYsgDgLohIvLrzLXP7ocU9018y5m2Q_P5HsRlWdUg34yqLc8pG8qa0Gt1kZw6VLn-aA/exec";

// Service Worker Registration for PWA capability
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function (err) {
      console.log('ServiceWorker registration skipped or failed: ', err);
    });
  }

  // --- TAB SWITCHING LOGIC ---
  $('.tab-btn').on('click', function () {
    const targetId = $(this).data('target');

    $('.tab-btn')
      .removeClass('border-brand-600 text-brand-600 active-tab')
      .addClass('border-transparent text-gray-500');
    
    $(this)
      .addClass('border-brand-600 text-brand-600 active-tab')
      .removeClass('border-transparent text-gray-500');

    $('.tab-content').addClass('hidden').removeClass('block');
    $('#' + targetId).removeClass('hidden').addClass('block');
  });

  // --- TOAST NOTIFICATION BANNER LOGIC ---
  let toastTimer = null;

  function showToast(message, durationInMs = 5000) {
    const $toast = $('#success-toast');
    $('#toast-message').text(message);

    // Clear any active timeout
    if (toastTimer) clearTimeout(toastTimer);

    // Fade in banner
    $toast.stop(true, true).fadeIn().removeClass('hidden');

    // Auto fade out after specified duration (e.g., 5000ms = 5 seconds)
    toastTimer = setTimeout(function () {
      $toast.fadeOut();
    }, durationInMs);
  }

  // Manual close button for toast notification
  $('#close-toast-btn').on('click', function () {
    if (toastTimer) clearTimeout(toastTimer);
    $('#success-toast').fadeOut();
  });

  // --- HELPER: GET IST DATE OBJECT ---
  function getISTDate() {
    const now = new Date();
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    return new Date(istString);
  }

  // --- HELPER: GET COMBINED IST DATE & TIMESTAMP STRING ---
  function getISTFormattedDateTime() {
    const options = {
      timeZone: "Asia/Kolkata",
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    return new Date().toLocaleString("en-IN", options) + " IST";
  }

  // --- CLIENT ID GENERATION (YYYYMMDDHHMMSS) ---
  function generateClientIdIST() {
    const ist = getISTDate();

    const year = ist.getFullYear();
    const month = String(ist.getMonth() + 1).padStart(2, '0');
    const day = String(ist.getDate()).padStart(2, '0');
    const hours = String(ist.getHours()).padStart(2, '0');
    const minutes = String(ist.getMinutes()).padStart(2, '0');
    const seconds = String(ist.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  function initializeFormDefaults() {
    const generatedId = generateClientIdIST();
    $('#client_id').val(generatedId);
    $('#display-client-id').text(generatedId);
  }

  // Initialize initial form state
  initializeFormDefaults();

  // --- FORM SUBMISSION HANDLER ---
  $('#add-client-form').on('submit', function (e) {
    e.preventDefault();

    const $submitBtn = $(this).find('button[type="submit"]');
    const originalBtnHtml = $submitBtn.html();

    // Disable button & show loading spinner
    $submitBtn.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin"></i> Saving...');

    // Generate exact execution timestamp & client ID
    const finalClientId = generateClientIdIST();
    const combinedDateTimeIST = getISTFormattedDateTime();

    $('#client_id').val(finalClientId);

    const formData = {
      clientID: finalClientId,
      clientName: $('#client_name').val().trim(),
      phone: $('#client_phone').val().trim(),
      email: $('#client_email').val().trim(),
      dateTimeIST: combinedDateTimeIST,
      meetingNotes: $('#meeting_notes').val().trim()
    };

    // HTTP POST to Google Apps Script Web App
    fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(() => {
      // Trigger top toast banner for 5 seconds instead of alert popup
      showToast(`Client ${formData.clientID} added successfully!`, 5000);

      // Reset form and regenerate client ID
      $('#add-client-form')[0].reset();
      initializeFormDefaults();
    })
    .catch((error) => {
      console.error('Error submitting form:', error);
      showToast('Error saving client record. Please try again.', 5000);
    })
    .finally(() => {
      $submitBtn.prop('disabled', false).html(originalBtnHtml);
    });
  });
});
