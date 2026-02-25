// assets/js/navigation.js

document.addEventListener("DOMContentLoaded", function () {

  const base = window.location.origin;
  const navPath = base + "/assets/includes/navigation.html";

  fetch(navPath)
    .then(response => {
      if (!response.ok) throw new Error("Failed to load navigation.html");
      return response.text();
    })
    .then(html => {

      const container = document.getElementById('navContainer');
      if (!container) return;

      container.innerHTML = html;

      const blobs = container.querySelectorAll('.blob-btn');

      blobs.forEach(blob => {

        const text = blob.querySelector('.blob-text');

        blob.style.cursor = "pointer";

        blob.addEventListener('click', () => {

          const id = blob.id;

          if (id === 'navHome') location.href = '/';
          if (id === 'navCom') location.href = '/commission.html';
          if (id === 'navArt') location.href = '/artwork.html';
          if (id === 'navPoll') location.href = '/poll.html';
          if (id === 'navContact') location.href = '/contact.html';

        });

        blob.addEventListener('mouseenter', () => {
          blob.style.transition = 'transform 0.3s ease';
          blob.style.transform = 'scale(1.2)';

          if (text) {
            text.style.transition = 'font-size 0.3s ease';
            text.style.fontSize = '22.8px';
          }
        });

        blob.addEventListener('mouseleave', () => {
          blob.style.transform = 'scale(1)';
          if (text) text.style.fontSize = '19px';
        });

      });

    })
    .catch(err => console.error('Navigation load error:', err));

});
