// format.js – common page behaviour (stars, gallery, zoom, commissions sparkles, contact form)
(function() {
  function init() {
    // Cursor sparkles (global)
    let lastStarTime = 0;
    document.addEventListener("mousemove", (e) => {
      const now = Date.now();
      if (now - lastStarTime < 45) return;
      lastStarTime = now;

      const star = document.createElement("div");
      star.className = "star";
      star.textContent = "✦";
      star.style.setProperty("--drift", Math.random());
      star.style.left = `${e.clientX}px`;
      star.style.top = `${e.clientY}px`;
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 2000);
    });

    // Full-page falling sparkles
    setInterval(() => {
      const star = document.createElement("div");
      star.className = "falling-star";
      star.textContent = "✦";
      star.style.left = Math.random() * 100 + "vw";
      star.style.top = "-10vh";
      star.style.setProperty("--drift", Math.random() * 2 - 1);
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 8000);
    }, 400);

    // Gallery loading (if exists)
    const gallery = document.getElementById("gallery");
    if (gallery) {
      const MAX_IMAGES = 12;
      const BASE = "https://www.velutinx.com/images/artwork/";
      for (let i = 1; i <= MAX_IMAGES; i++) {
        const img = document.createElement("img");
        img.src = BASE + i + ".jpg";
        img.alt = `Artwork sample ${i}`;
        img.onerror = () => img.remove();
        img.loading = "lazy";
        gallery.appendChild(img);
      }
    }

    // Zoom functionality (if gallery exists)
    let activeClone = null;
    let originRect = null;
    document.addEventListener("click", (e) => {
      const img = e.target.closest(".gallery img");
      if (!img) return;

      originRect = img.getBoundingClientRect();
      const scrollY = window.scrollY;

      const clone = img.cloneNode();
      clone.className = "zoom-image";

      clone.style.top = originRect.top + scrollY + "px";
      clone.style.left = originRect.left + "px";
      clone.style.width = originRect.width + "px";
      clone.style.height = originRect.height + "px";

      document.body.appendChild(clone);
      activeClone = clone;

      clone.getBoundingClientRect();
      document.getElementById("zoomOverlay").classList.add("active");
      document.body.classList.add("zoom-active");

      requestAnimationFrame(() => {
        const vw = window.innerWidth * 0.9;
        const vh = window.innerHeight * 0.9;
        const imgRatio = originRect.width / originRect.height;
        const viewRatio = vw / vh;

        let w, h;
        if (imgRatio > viewRatio) {
          w = vw;
          h = vw / imgRatio;
        } else {
          h = vh;
          w = vh * imgRatio;
        }

        clone.style.left = (window.innerWidth - w) / 2 + "px";
        clone.style.top = (window.innerHeight - h) / 2 + scrollY + "px";
        clone.style.width = w + "px";
        clone.style.height = h + "px";
      });
    });

    const zoomOverlay = document.getElementById("zoomOverlay");
    if (zoomOverlay) {
      zoomOverlay.onclick = () => {
        if (!activeClone) return;

        const scrollY = window.scrollY;
        activeClone.style.left = originRect.left + "px";
        activeClone.style.top = originRect.top + scrollY + "px";
        activeClone.style.width = originRect.width + "px";
        activeClone.style.height = originRect.height + "px";

        zoomOverlay.classList.remove("active");
        document.body.classList.remove("zoom-active");

        setTimeout(() => {
          activeClone.remove();
          activeClone = null;
          originRect = null;
        }, 230);
      };
    }

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
    
    // Commission box sparkles (if exists)
    const commissionBox = document.getElementById("commissionBox");
    if (commissionBox) {
      setInterval(() => {
        const star = document.createElement("div");
        star.className = "box-star";
        star.textContent = "✦";
        star.style.left = `${Math.random() * commissionBox.clientWidth}px`;
        star.style.top = "0px";
        commissionBox.appendChild(star);
        setTimeout(() => star.remove(), 6000);
      }, 700);
    }

    // Contact form handling and social area sparkles (if exists)
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
      const socialArea = document.getElementById("socialArea");
      if (socialArea) {
        setInterval(() => {
          const star = document.createElement("div");
          star.className = "social-star";
          star.textContent = "✦";
          star.style.left = Math.random() * socialArea.clientWidth + "px";
          star.style.top = "0px";
          socialArea.appendChild(star);
          setTimeout(() => star.remove(), 6000);
        }, 700);
      }

      contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        if (!name || !email || !message) {
          const errMsg = window.translations?.contact?.[window.currentLanguage]?.errorText || "Please fill out all fields correctly ♡";
          alert(errMsg);
          return;
        }

        const formData = new FormData(contactForm);
        try {
          const response = await fetch(contactForm.action, {
            method: "POST",
            body: formData,
            headers: { Accept: "application/json" }
          });
          if (response.ok) {
            const successMsg = window.translations?.contact?.[window.currentLanguage]?.successText || "Message sent successfully! You will hear back soon! ♡♡";
            alert(successMsg);
            contactForm.reset();
          } else {
            throw new Error("Formspree error");
          }
        } catch (err) {
          alert("There was a problem sending your message. Please try again later.");
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
