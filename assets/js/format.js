// format.js – custom cursor, magnetic social grid, gallery, zoom, & commission sparkles
(function() {
  function init() {
    // ---------- 1. INJECT CURSOR ELEMENTS ----------
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);

    const cursorRing = document.createElement('div');
    cursorRing.className = 'cursor-ring';
    document.body.appendChild(cursorRing);

    document.body.classList.add('custom-cursor-active');

    // ---------- 2. GSAP CURSOR TRACKING ----------
    let mouse = { x: 0, y: 0 };
    let ring = { x: 0, y: 0 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      gsap.to(cursorDot, {
        x: mouse.x,
        y: mouse.y,
        duration: 0.1,
        ease: 'power2.out'
      });
    });

    gsap.ticker.add(() => {
      ring.x += (mouse.x - ring.x) * 0.15;
      ring.y += (mouse.y - ring.y) * 0.15;
      gsap.set(cursorRing, { x: ring.x, y: ring.y });
    });

    // ---------- 3. CURSOR RING EXPAND ON HOVER ----------
    // Generic listener for any element with data-cursor-expand
    function addCursorExpandListeners() {
      document.querySelectorAll('[data-cursor-expand]').forEach(el => {
        // Avoid adding multiple listeners if the script runs again
        if (el.dataset.cursorExpandBound) return;
        el.dataset.cursorExpandBound = 'true';

        el.addEventListener('mouseenter', () => {
          cursorRing.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
          cursorRing.classList.remove('active');
        });
      });
    }
    // Initial run and also observe for dynamically added elements
    addCursorExpandListeners();
    const observer = new MutationObserver(() => addCursorExpandListeners());
    observer.observe(document.body, { childList: true, subtree: true });

    // ---------- 4. BUILD MAGNETIC SOCIAL GRID ----------
    const socialArea = document.getElementById('socialArea');
    if (socialArea) {
      socialArea.innerHTML = '';

      const container = document.createElement('div');
      container.className = 'social-container';

      const links = [
        { href: 'https://x.com/VelutinxSFW', img: 'https://www.velutinx.com/images/LogoTwitter.png', label: 'Twitter' },
        { href: 'https://bsky.app/profile/velutinxx.bsky.social', img: 'https://www.velutinx.com/images/LogoBluesky.png', label: 'Bluesky' },
        { href: 'https://www.pixiv.net/en/users/117116845', img: 'https://www.velutinx.com/images/LogoPixiv.png', label: 'Pixiv' },
        { href: 'https://discord.gg/HKyH4bmQez', img: 'https://www.velutinx.com/images/LogoDiscord.png', label: 'Discord' },
        { href: 'https://www.instagram.com/velutinxx/', img: 'https://www.velutinx.com/images/LogoInstagram.png', label: 'Instagram' },
        { href: 'https://www.patreon.com/c/Velutinx_', img: 'https://www.velutinx.com/images/LogoPatreon.png', label: 'Patreon' },
        { href: 'https://ko-fi.com/velutinxstudio', img: 'https://www.velutinx.com/images/LogoKoFi.png', label: 'Ko‑fi' },
        { href: 'https://subscribestar.adult/velutinx', img: 'https://www.velutinx.com/images/LogoSubscribeStar.png', label: 'SubscribeStar' }
      ];

      const ul = document.createElement('ul');
      ul.className = 'box-social';

      links.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.href;
        a.target = '_blank';
        a.className = 'magnetic-wrap';
        a.setAttribute('data-magnetic', '');

        const inner = document.createElement('span');
        inner.className = 'magnetic-inner';
        inner.innerHTML = `<img src="${link.img}" alt="${link.label}"><span>${link.label}</span>`;

        a.appendChild(inner);
        li.appendChild(a);
        ul.appendChild(li);
      });

      container.appendChild(ul);
      socialArea.appendChild(container);

      // ---------- 5. MAGNETIC EFFECT ----------
      const magnetics = document.querySelectorAll('[data-magnetic]');
      magnetics.forEach((el) => {
        const inner = el.querySelector('.magnetic-inner');

        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = (e.clientX - cx) * 0.4;
          const dy = (e.clientY - cy) * 0.4;

          gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
          gsap.to(inner, { x: dx * 0.5, y: dy * 0.5, duration: 0.3, ease: 'power2.out' });
        });

        el.addEventListener('mouseenter', () => {
          cursorRing.classList.add('active');
        });

        el.addEventListener('mouseleave', () => {
          cursorRing.classList.remove('active');
          gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
          gsap.to(inner, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
        });
      });
    }

    // ---------- 6. GALLERY LOADING (unchanged) ----------
    const gallery = document.getElementById("gallery");
    if (gallery) {
      const MAX_IMAGES = 12;
      const BASE = "https://www.velutinx.com/images/artwork/";
      for (let i = 1; i <= MAX_IMAGES; i++) {
        const img = document.createElement("img");
        img.src = BASE + i + ".jpg";
        img.alt = `Artwork sample ${i}`;
        img.onerror = () => img.remove();
        img.loading = "lazy";
        gallery.appendChild(img);
      }
    }

    // ---------- 7. ZOOM FUNCTIONALITY (unchanged) ----------
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

    // ---------- 8. COMMISSION BOX SPARKLES (keep) ----------
    const commissionBox = document.getElementById("commissionBox");
    if (commissionBox) {
      setInterval(() => {
        const star = document.createElement("div");
        star.className = "box-star";
        star.textContent = "✦";
        star.style.left = `${Math.random() * commissionBox.clientWidth}px`;
        star.style.top = "0px";
        commissionBox.appendChild(star);
        setTimeout(() => star.remove(), 6000);
      }, 700);
    }

    // ---------- 9. CONTACT FORM HANDLING (unchanged) ----------
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
      contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        if (!name || !email || !message) {
          const errMsg = window.translations?.contact?.[window.currentLanguage]?.errorText || "Please fill out all fields correctly ♡";
          alert(errMsg);
          return;
        }

        const formData = new FormData(contactForm);
        try {
          const response = await fetch(contactForm.action, {
            method: "POST",
            body: formData,
            headers: { Accept: "application/json" }
          });
          if (response.ok) {
            const successMsg = window.translations?.contact?.[window.currentLanguage]?.successText || "Message sent successfully! You will hear back soon! ♡♡";
            alert(successMsg);
            contactForm.reset();
          } else {
            throw new Error("Formspree error");
          }
        } catch (err) {
          alert("There was a problem sending your message. Please try again later.");
        }
      });
    }

    // ---------- 10. GLOBAL FALLING STARS (keep) ----------
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
