//     velutinx.github.io/assets/js/tab-title-animation.js

(function() {
  const BASE_TITLE = "VELUTINX";
  const FULL_DURATION = 2000;
  const BLANK_DURATION = 300;
  const SHRINK_INTERVAL = 200;
  const PAGE_SHOW_DURATION = 3000;

  const PAGE_TITLES = {
    "/":               "HOME",
    "/index.html":     "HOME",
    "/commission.html": "COMMISSIONS",
    "/commission":      "COMMISSIONS",
    "/artwork.html":   "ARTWORK",
    "/artwork":         "ARTWORK",
    "/contact.html":   "CONTACT",
    "/contact":         "CONTACT",
    "/poll.html":      "POLL",
    "/poll":            "POLL",
    "/store.html":     "STORE",
    "/store":           "STORE"
  };

  // ──────────────────────────────────────────────
  // 1. TAB TITLE ANIMATION
  // ──────────────────────────────────────────────
  function animateTitle() {
    const currentPath = window.location.pathname.toLowerCase();
    let pageTitle = PAGE_TITLES[currentPath] || BASE_TITLE;

    if (pageTitle === BASE_TITLE) {
      if (currentPath.includes("commission")) pageTitle = "COMMISSIONS";
      else if (currentPath.includes("artwork")) pageTitle = "ARTWORK";
      else if (currentPath.includes("contact")) pageTitle = "CONTACT";
      else if (currentPath.includes("poll")) pageTitle = "POLL";
      else if (currentPath.includes("store")) pageTitle = "STORE";
      else if (currentPath === "" || currentPath === "/") pageTitle = "HOME";
    }

    document.title = BASE_TITLE;

    setTimeout(() => {
      let blankCount = 0;
      const blankInterval = setInterval(() => {
        document.title = "♡";
        setTimeout(() => {
          document.title = BASE_TITLE;
          blankCount++;
          if (blankCount >= 3) {
            clearInterval(blankInterval);
            document.title = pageTitle;
            setTimeout(() => {
              let current = pageTitle;
              const shrink = setInterval(() => {
                if (current.length <= 0) {
                  clearInterval(shrink);
                  animateTitle();
                  return;
                }
                current = current.slice(1);
                document.title = current || "♡";
              }, SHRINK_INTERVAL);
            }, PAGE_SHOW_DURATION);
          }
        }, BLANK_DURATION);
      }, BLANK_DURATION * 2);
    }, FULL_DURATION);
  }

  // ──────────────────────────────────────────────
  // 2. SMOOTH PAGE REVEAL ANIMATION
  //    Only plays on subpages, NOT on the root "/"
  //    because the root has its own cinematic intro.
  // ──────────────────────────────────────────────
  function initPageReveal() {
    const path = window.location.pathname.toLowerCase();

    // Check if we're on the root (where cinematic intro plays)
    const isRoot = (path === '' || path === '/' || path === '/index.html');

    // Only reveal if:
    // 1. The #mainWebsite exists (it does on index/root, might not on subpages)
    // 2. We're NOT on the root (cinematic intro handles its own reveal)
    // 3. OR we ARE on the root but the cinematic intro skipped (e.g., /index.html direct hit)
    const main = document.getElementById('mainWebsite');
    
    if (isRoot && main) {
      // Root path – cinematic intro will handle the reveal.
      // Just make sure #page doesn't animate (inline styles already handle this)
      const page = document.getElementById('page');
      if (page) {
        page.style.opacity = '1';
        page.style.transform = 'none';
        page.style.animation = 'none';
      }
      return;
    }

    // Subpage – apply smooth reveal
    const page = document.getElementById('page');
    if (!page) return;

    // Inject reveal keyframes if not already present
    if (!document.getElementById('pageRevealStyles')) {
      const style = document.createElement('style');
      style.id = 'pageRevealStyles';
      style.textContent = `
        @keyframes pageReveal {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Apply animation
    page.style.opacity = '0';
    page.style.transform = 'translateY(60px)';
    page.style.animation = 'pageReveal 0.7s ease-out forwards';
  }

  // ──────────────────────────────────────────────
  // 3. INITIALISE EVERYTHING
  // ──────────────────────────────────────────────
  function init() {
    // Start tab title animation
    animateTitle();

    // Apply smooth page reveal (if applicable)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initPageReveal);
    } else {
      initPageReveal();
    }
  }

  init();
})();
