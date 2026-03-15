// socials.js – form handling and UI for the contact page

document.addEventListener('DOMContentLoaded', () => {
  // Form submission and validation
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const message = document.getElementById('message');

      [name, email, message].forEach(input => {
        input.style.borderColor = '';
        input.style.animation = 'none';
      });

      let hasError = false;

      if (!name.value.trim()) {
        name.style.borderColor = '#b33';
        name.style.animation = 'shake 0.35s';
        hasError = true;
      }
      if (!email.value.trim() || !email.value.includes('@')) {
        email.style.borderColor = '#b33';
        email.style.animation = 'shake 0.35s';
        hasError = true;
      }
      if (!message.value.trim()) {
        message.style.borderColor = '#b33';
        message.style.animation = 'shake 0.35s';
        hasError = true;
      }

      if (hasError) {
        const errorText = (typeof translations !== 'undefined' && translations.contact?.[currentLanguage]?.errorText) ||
          'Please fill out all fields correctly ♡';
        showPopup(errorText);
        return;
      }

      const successText = (typeof translations !== 'undefined' && translations.contact?.[currentLanguage]?.successText) ||
        'Message sent successfully! You will hear back soon! ♡♡';
      showPopup(successText);

      form.submit();
    });
  }

  // Send button shake
  const sendBtn = document.getElementById('sendBtn');
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      sendBtn.style.animation = 'none';
      void sendBtn.offsetWidth; // force reflow
      sendBtn.style.animation = 'shake 0.35s';
    });
  }

  // Language switching for contact page
  document.querySelectorAll('.lang-item').forEach(item => {
    item.addEventListener('click', () => {
      if (typeof setLanguage === 'function') setLanguage(item.dataset.lang);
    });
  });

  // Apply translations when page loads or language changes
  if (typeof applyTranslations === 'function') {
    applyTranslations('contact');
    document.addEventListener('languageChanged', () => applyTranslations('contact'));
  }
});

// Popup function (used by form)
function showPopup(text) {
  const popup = document.createElement('div');
  popup.textContent = text;
  popup.style.position = 'fixed';
  popup.style.top = '20px';
  popup.style.right = '20px';
  popup.style.background = '#eeeae0';
  popup.style.border = '3px solid #aa9e76';
  popup.style.padding = '14px 18px';
  popup.style.borderRadius = '10px';
  popup.style.fontSize = '13px';
  popup.style.fontWeight = '700';
  popup.style.color = '#b33';
  popup.style.boxShadow = '6px 6px 0 rgba(0,0,0,0.4)';
  popup.style.zIndex = '99999';
  popup.style.opacity = '0';
  popup.style.transition = 'opacity 0.5s ease';
  document.body.appendChild(popup);

  setTimeout(() => popup.style.opacity = '1', 10);
  setTimeout(() => {
    popup.style.opacity = '0';
    setTimeout(() => popup.remove(), 500);
  }, 5000);
}
