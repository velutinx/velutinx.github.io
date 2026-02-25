// assets/js/tab-title-animation.js
// Shared tab title animation — used on all pages

// Configuration
const BASE_TITLE = "VELUTINX";
const FULL_DURATION = 2000;          // VELUTINX solid at start
const BLANK_DURATION = 300;          // each blank flash (only on home)
const SHRINK_INTERVAL = 200;         // scrolling speed
const PAGE_SHOW_DURATION = 3000;     // page title shown for 3s

// Page titles
const PAGE_TITLES = {
  "/":               "HOME",
  "/index.html":     "HOME",
  "/commission.html": "COMMISSIONS",
  "/artwork.html":   "ARTWORK",
  "/contact.html":   "CONTACT",
  "/poll.html":      "POLL"
};

function animateTitle() {
  const currentPath = window.location.pathname.toLowerCase();
  let pageTitle = BASE_TITLE;

  // Determine page title
  if (PAGE_TITLES[currentPath]) {
    pageTitle = PAGE_TITLES[currentPath];
  } else if (currentPath.includes("commission")) pageTitle = "COMMISSIONS";
  else if (currentPath.includes("artwork")) pageTitle = "ARTWORK";
  else if (currentPath.includes("contact")) pageTitle = "CONTACT";
  else if (currentPath.includes("poll")) pageTitle = "POLL";

  // Set initial title immediately (no flash)
  document.title = BASE_TITLE;

  // Only run full animation (with blanks) on home/root
  const isHome = currentPath === '/' || currentPath === '' || currentPath === '/index.html';

  setTimeout(() => {
    if (isHome) {
      // Phase 2: Three quick blank flashes (only on home)
      let blankCount = 0;
      const blankInterval = setInterval(() => {
        document.title = "⠀";  // single invisible char
        setTimeout(() => {
          document.title = BASE_TITLE;
          blankCount++;
          if (blankCount >= 3) {
            clearInterval(blankInterval);

            // Phase 3: Show page title for 3s
            document.title = pageTitle;
            setTimeout(() => {
              // Phase 4: Shrink title
              let current = pageTitle;
              const shrink = setInterval(() => {
                if (current.length <= 0) {
                  clearInterval(shrink);
                  animateTitle(); // loop
                  return;
                }
                current = current.slice(1);
                document.title = current || "⠀";
              }, SHRINK_INTERVAL);
            }, PAGE_SHOW_DURATION);
          }
        }, BLANK_DURATION);
      }, BLANK_DURATION * 2);
    } else {
      // Subpages: just set page title once (no flashes)
      document.title = pageTitle;
    }
  }, 500); // longer delay to prevent any initial flicker
}

// Start animation with tiny delay
setTimeout(animateTitle, 100);
