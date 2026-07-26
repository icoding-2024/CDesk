$(document).ready(function () {
  // Register Service Worker for PWA compliance
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function (err) {
      console.log('ServiceWorker registration skipped or failed: ', err);
    });
  }

  // --- TAB SWITCHING LOGIC ---
  $('.tab-btn').on('click', function () {
    const targetId = $(this).data('target');

    // Update active tab styling
    $('.tab-btn')
      .removeClass('border-brand-600 text-brand-600 active-tab')
      .addClass('border-transparent text-gray-500');
    
    $(this)
      .addClass('border-brand-600 text-brand-600 active-tab')
      .removeClass('border-transparent text-gray-500');

    // Show target section, hide others
    $('.tab-content').addClass('hidden').removeClass('block');
    $('#' + targetId).removeClass('hidden').addClass('block');
  });

  // --- HELPER: GET IST DATE OBJECT ---
  function getISTDate() {
    const now = new Date();
    // Convert current time to Asia/Kolkata timezone string, then construct Date object
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    return new Date(istString);
  }

  // --- CLIENT ID & INITIALIZATION LOGIC ---
  function generateClientIdIST() {
    const ist = getISTDate();

    const year = ist.getFullYear();
    const month = String(ist.getMonth() + 1).padStart(2, '0');
    const day = String(ist.getDate()).padStart(2, '0');
    const hours = String(ist.getHours()).padStart(2, '0');
    const minutes = String(ist.getMinutes()).padStart(2, '0');
    const seconds = String(ist.getSeconds()).padStart(2, '0');

    // Format: YYYYMMDDHHMMSS (IST timezone)
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  function initializeFormDefaults() {
    const ist = getISTDate();

    // 1. Generate Client ID using IST time format (YYYYMMDDHHMMSS)
    const generatedId = generateClientIdIST();
    $('#client_id').val(generatedId);
    $('#display-client-id').text(generatedId);

    // 2. Set Updation Date to today in IST (YYYY-MM-DD)
    const year = ist.getFullYear();
    const month = String(ist.getMonth() + 1).padStart(2, '0');
    const day = String(ist.getDate()).padStart(2, '0');
    const todayYYYYMMDD = `${year}-${month}-${day}`;
    $('#update_date').val(todayYYYYMMDD);

    // 3. Set ISO Timestamp
    $('#created_timestamp').val(new Date().toISOString());
  }

  // Run on page load
  initializeFormDefaults();

  // --- FORM SUBMISSION ---
  $('#add-client-form').on('submit', function (e) {
    e.preventDefault();

    // Re-generate current ID and timestamp at exact submission moment
    const finalClientId = generateClientIdIST();
    $('#client_id').val(finalClientId);
    $('#created_timestamp').val(new Date().toISOString());

    // Gather form payload including meeting notes
    const formData = {
      clientID: $('#client_id').val(),
      clientName: $('#client_name').val(),
      phone: $('#client_phone').val(),
      email: $('#client_email').val(),
      updateDate: $('#update_date').val(),
      meetingNotes: $('#meeting_notes').val().trim(),
      timestamp: $('#created_timestamp').val()
    };

    console.log('Prepared Database Payload:', formData);
    alert(`Client Saved Successfully!\nAssigned ID: ${formData.clientID}`);

    // Reset Form & Regenerate auto-fields for next client
    this.reset();
    initializeFormDefaults();
  });
});