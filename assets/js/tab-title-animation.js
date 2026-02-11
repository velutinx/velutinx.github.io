// Shared tab title animation — used on all pages

// Configuration — edit timings here
const BASE_TITLE = "VELUTINX";
const FULL_DURATION = 2000;          // VELUTINX solid at start
const BLANK_DURATION = 300;          // each blank flash
const SHRINK_INTERVAL = 200;         // scrolling speed (lower = faster)
const PAGE_SHOW_DURATION = 3000;     // page title (ARTWORK) shown for 3s

// Map paths to page-specific titles for the shrink phase
const PAGE_TITLES = {
  "/":               "HOME",
  "/index.html":     "HOME",
  "/commission.html": "COMMISSIONS",
  "/artwork.html":   "ARTWORK",
  "/contact.html":   "CONTACT",
  "/poll-website/":  "POLL"
};

function animateTitle() {
  // Get current page title
  const currentPath = window.location.pathname;
  let pageTitle = BASE_TITLE; // fallback

  if (PAGE_TITLES[currentPath]) {
    pageTitle = PAGE_TITLES[currentPath];
  } else {
    // Fallback detection
    if (currentPath.includes("commission")) pageTitle = "COMMISSIONS";
    if (currentPath.includes("artwork"))    pageTitle = "ARTWORK";
    if (currentPath.includes("contact"))    pageTitle = "CONTACT";
    if (currentPath.includes("poll"))       pageTitle = "POLL";
  }

  // Phase 1: VELUTINX solid for 2 seconds
  document.title = BASE_TITLE;

  setTimeout(() => {
    // Phase 2: Three quick blank flashes
    let blankCount = 0;
    const blankInterval = setInterval(() => {
document.title = "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀♡";  // three different invisible chars
      setTimeout(() => {
        document.title = BASE_TITLE;
        blankCount++;
        if (blankCount >= 3) {
          clearInterval(blankInterval);

          // Phase 3: Show page-specific title for 3 seconds
          document.title = pageTitle;
          setTimeout(() => {
            // Phase 4: Shrink the page-specific title
            let current = pageTitle;
            const shrink = setInterval(() => {
              if (current.length <= 0) {
                clearInterval(shrink);
                animateTitle(); // loop back
                return;
              }
              current = current.slice(1); // remove first letter
              document.title = current || "\u200B";
            }, SHRINK_INTERVAL);
          }, PAGE_SHOW_DURATION);
        }
      }, BLANK_DURATION);
    }, BLANK_DURATION * 2); // time between flashes
  }, FULL_DURATION);
}

// Start the animation
animateTitle();
