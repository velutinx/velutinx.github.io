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
})();
