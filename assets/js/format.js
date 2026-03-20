// format.js – common page behaviour (stars, gallery, zoom)
(function() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Cursor sparkles
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

    // Gallery loading – only images 1 to 12 exist (adjust MAX_IMAGES as needed)
    const MAX_IMAGES = 12;
    const BASE = "https://www.velutinx.com/images/artwork/";
    const gallery = document.getElementById("gallery");
    if (gallery) {
      for (let i = 1; i <= MAX_IMAGES; i++) {
        const img = document.createElement("img");
        img.src = BASE + i + ".jpg";
        img.alt = `Artwork sample ${i}`;
        img.onerror = () => img.remove();
        img.loading = "lazy";
        gallery.appendChild(img);
      }
    }

    // Zoom functionality
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

    // Apply artwork translations (if translations are loaded)
    if (window.applyTranslations) {
      window.applyTranslations('artwork');
      document.addEventListener('languageChanged', () => {
        window.applyTranslations('artwork');
      });
    }

    
// Add commission box sparkles if element exists
(function initCommissionSparkles() {
  const commissionBox = document.getElementById('commissionBox');
  if (commissionBox) {
    setInterval(() => {
      const star = document.createElement('div');
      star.className = 'box-star';
      star.textContent = '✦';
      star.style.left = `${Math.random() * commissionBox.clientWidth}px`;
      star.style.top = '0px';
      commissionBox.appendChild(star);
      setTimeout(() => star.remove(), 6000);
    }, 700);
  }
}

/* ==================== CONTACT PAGE STYLES ==================== */
.contact-wrap {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 60px;
  display: grid;
  grid-template-columns: 70% 30%;
  gap: 40px;
  background: transparent;
}

/* Form side – transparent glass */
.contact-left {
  background: transparent;
  border: 2px solid var(--divider, #aa9e76);
  border-radius: 14px;
  padding: 32px;
  box-shadow: 8px 8px 0 rgba(0,0,0,0.35);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
}

.contact-left::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(238, 234, 224, 0.18);
  border-radius: 12px;
  z-index: -1;
  pointer-events: none;
}

body.dark .contact-left {
  border-color: var(--divider-dark, #6f6a4e);
  box-shadow: 8px 8px 0 rgba(0,0,0,0.5);
}

body.dark .contact-left::before {
  background: rgba(22, 22, 27, 0.25);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid var(--divider, #aa9e76);
  border-radius: 6px;
  background: transparent;
  font-size: 13px;
  transition: 0.2s ease;
  color: var(--text);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

body.dark .form-group input,
body.dark .form-group textarea {
  background: transparent;
  color: var(--text-dark);
  border-color: var(--divider-dark);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
}

.send-btn {
  margin-top: 10px;
  padding: 10px 26px;
  border: none;
  border-radius: 999px;
  background: var(--divider, #aa9e76);
  font-weight: 700;
  letter-spacing: 2px;
  cursor: pointer;
  z-index: 2;
  color: inherit;
}

body.dark .send-btn {
  background: var(--divider-dark, #6f6a4e);
  color: var(--text-dark);
}

/* Social column – this is for the social buttons area (non‑circular menu) */
.contact-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  position: relative;
}

/* The circular social menu (from socials.css) is separate and will be placed inside .contact-right.
   We keep its own styles, but we may need to ensure it doesn't overflow.
   The following ensures the menu container respects its parent width. */
.contact-right .menu {
  transform: translate(200px, 200px); /* as original */
  /* other styles are from socials.css */
}



)();
