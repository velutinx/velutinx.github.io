// Shared tab title animation — used on all pages

// Configuration — edit timings here
const BASE_TITLE = "VELUTINX";
const FULL_DURATION = 2000;          // VELUTINX solid at start
const BLANK_DURATION = 300;          // each blank flash
const SHRINK_INTERVAL = 200;         // faster scrolling (was 600)
const SHRINK_STEPS_OFFSET = 1;       // how many letters to remove each step

// Map paths to page-specific titles for the shrink phase
const PAGE_TITLES = {
  "/":               "HOME",
  "/index.html":     "HOME",
  "/commission.html": "COMMISSIONS",
  "/artwork.html":   "ARTWORK",
  "/contact.html":   "CONTACT",
  "/poll-website/":  "POLL"
  // Add more pages here when you create them
};

function animateTitle() {
  // Get current page title
  const currentPath = window.location.pathname;
  let pageTitle = BASE_TITLE; // fallback

  // Find matching page title
  if (PAGE_TITLES[currentPath]) {
    pageTitle = PAGE_TITLES[currentPath];
  } else {
    // Fallback detection for common cases
    if (currentPath.includes("commission")) pageTitle = "COMMISSIONS";
    if (currentPath.includes("artwork"))    pageTitle = "ARTWORK";
    if (currentPath.includes("contact"))    pageTitle = "CONTACT";
    if (currentPath.includes("poll"))       pageTitle = "POLL";
  }

  // Phase 1: VELUTINX solid for 2 seconds
  document.title = BASE_TITLE;
  setTimeout(() => {
    // Phase 2: Three quick blank flashes (use " " to avoid white flash)
    let blankCount = 0;
    const blankInterval = setInterval(() => {
      document.title = "⠀⠀⠀⠀⠀⠀";  // single space → truly blank, no white text
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
              current = current.slice(1); // remove first letter
              document.title = current || " ";
              if (current.length <= 0) {
                clearInterval(shrink);
                // Loop back to start
                animateTitle();
              }
            }, SHRINK_INTERVAL);
          }, 3000); // 3 seconds of full page title
        }
      }, BLANK_DURATION);
    }, BLANK_DURATION * 2); // time between flashes
  }, FULL_DURATION);
}

// Start the animation
animateTitle();
