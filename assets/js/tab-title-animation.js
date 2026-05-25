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

  animateTitle();
})();
