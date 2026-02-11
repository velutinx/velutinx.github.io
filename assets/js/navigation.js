// assets/js/navigation.js
fetch('/assets/includes/navigation.html')
  .then(response => {
    if (!response.ok) throw new Error(`Failed to load navigation.html: ${response.status}`);
    return response.text();
  })
  .then(html => {
    const container = document.getElementById('navContainer');
    if (!container) {
      console.warn('Navigation container #navContainer not found');
      return;
    }

    container.innerHTML = html;

    // Now that the blobs are in the DOM, attach click handlers
    const blobs = {
      navHome:    "/",
      navCom:     "/commission.html",
      navArt:     "/artwork.html",
      navPoll:    "/poll-website/",
      navContact: "/contact.html"
    };

    Object.entries(blobs).forEach(([id, url]) => {
      const element = document.getElementById(id);
      if (element) {
        element.style.cursor = "pointer";
        element.addEventListener('click', () => {
          location.href = url;
        });
      } else {
        console.warn(`Blob with id "${id}" not found`);
      }
    });
  })
  .catch(err => {
    console.error('Error loading navigation:', err);
  });
