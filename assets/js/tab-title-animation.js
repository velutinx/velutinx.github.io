// assets/js/tab-title-animation.js
const BASE_TITLE = "VELUTINX";
const FULL_DURATION = 2000;
const BLANK_DURATION = 300;
const SHRINK_INTERVAL = 200;
const PAGE_SHOW_DURATION = 3000;

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

  if (PAGE_TITLES[currentPath]) {
    pageTitle = PAGE_TITLES[currentPath];
  } else {
    if (currentPath.includes("commission")) pageTitle = "COMMISSIONS";
    if (currentPath.includes("artwork"))    pageTitle = "ARTWORK";
    if (currentPath.includes("contact"))    pageTitle = "CONTACT";
    if (currentPath.includes("poll"))       pageTitle = "POLL";
  }

  // Set initial title immediately
  document.title = BASE_TITLE;

  const isHome = currentPath === '/' || currentPath === '';

  setTimeout(() => {
    if (isHome) {
      // Only on home: do the full animation with blank flashes
      let blankCount = 0;
      const blankInterval = setInterval(() => {
        document.title = "⠀"; // single invisible char
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
      // Subpages: just set page title once (no blanks, no flash)
      document.title = pageTitle;
    }
  }, 600); // safe delay
}

setTimeout(animateTitle, 300); // increased delay for safety
