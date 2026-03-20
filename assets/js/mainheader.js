(async function() {
  const navContainer = document.getElementById('navContainer');
  if (!navContainer) return;

  try {
    const response = await fetch('/assets/includes/header.html');
    const html = await response.text();
    navContainer.innerHTML = html;

    // --- DOM elements after injection ---
    const logo = document.querySelector('.logo');
    const storeBtn = document.getElementById('storeBtn');
    const langBtn = document.getElementById('langBtn');
    const langPopover = document.getElementById('languagePopover');
    const themeBtn = document.getElementById('themeBtn');
    const cartBtn = document.getElementById('cartBtn');
    const floatCartBtn = document.getElementById('floatingCartBtn');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartClose = document.getElementById('cartClose');
    const cartItemsEl = document.getElementById('cartItems');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarMenuToggle = document.getElementById('sidebarMenuToggle');
    const snackbar = document.getElementById('snackbar');

    // Create cart overlay if not exists
    let cartOverlay = document.getElementById('cartOverlay');
    if (!cartOverlay) {
      cartOverlay = document.createElement('div');
      cartOverlay.id = 'cartOverlay';
      cartOverlay.className = 'cart-overlay';
      document.body.appendChild(cartOverlay);
    }

    // --- Helper functions ---
    function showSnackbar() {
      snackbar.classList.add('show');
      setTimeout(() => snackbar.classList.remove('show'), 2000);
    }

    function getCart() {
      try {
        return JSON.parse(localStorage.getItem('velutinx_cart') || '[]');
      } catch(e) {
        return [];
      }
    }

    function saveCart(cart) {
      localStorage.setItem('velutinx_cart', JSON.stringify(cart));
    }

    function formatPrice(value) {
      // Simple fallback formatting – you can expand later
      return `US$${value.toFixed(2)}`;
    }

    function updateCartDisplay() {
      const cart = getCart();
      const count = cart.length;
      const total = cart.reduce((s, i) => s + i.price, 0);
      document.querySelectorAll('#cartCount, #floatingCartCount').forEach(el => {
        if (el) el.textContent = count;
      });
      if (cartItemsEl) {
        if (count === 0) {
          cartItemsEl.innerHTML = '<p>Your cart is empty</p>';
        } else {
          cartItemsEl.innerHTML = '';
          cart.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
              <img src="${item.image}" alt="${item.title}">
              <div class="cart-item-info">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
              </div>
              <button class="cart-item-remove" data-idx="${idx}">×</button>
            `;
            cartItemsEl.appendChild(div);
          });
        }
        const totalEl = document.getElementById('cartTotal');
        if (totalEl) totalEl.textContent = formatPrice(total);
      }
    }

    // Cart open/close with overlay
    function openCart() {
      cartDrawer.classList.add('open');
      cartOverlay.classList.add('active');
      blurLayer.classList.add('active'); // ✅ ADD
      document.body.classList.add('drawer-open');
    }
    function closeCart() {
      cartDrawer.classList.remove('open');
      cartOverlay.classList.remove('active');
      blurLayer.classList.remove('active'); // ✅ ADD
      document.body.classList.remove('drawer-open');
    }

    if (cartBtn && floatCartBtn && cartClose && cartDrawer) {
      cartBtn.addEventListener('click', openCart);
      floatCartBtn.addEventListener('click', openCart);
      cartClose.addEventListener('click', closeCart);
      cartOverlay.addEventListener('click', closeCart);
    }

    // Remove items from cart
    if (cartItemsEl) {
      cartItemsEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('cart-item-remove')) {
          const idx = parseInt(e.target.dataset.idx);
          const cart = getCart();
          cart.splice(idx, 1);
          saveCart(cart);
          updateCartDisplay();
        }
      });
    }

    // Sidebar toggle
    function openSidebar() {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('active');
      blurLayer.classList.add('active'); // ✅ ADD
      document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
      blurLayer.classList.remove('active'); // ✅ ADD
      document.body.style.overflow = '';
    }
    if (menuToggle && sidebarMenuToggle && sidebarOverlay) {
      menuToggle.addEventListener('click', openSidebar);
      sidebarMenuToggle.addEventListener('click', closeSidebar);
      sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Theme toggle
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('darkMode', document.body.classList.contains('dark'));
      });
      // Initialise dark mode from localStorage
      if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
      }
    }

    // Logo and store button redirects
    if (logo) logo.addEventListener('click', () => window.location.href = '/');
    if (storeBtn) storeBtn.addEventListener('click', () => window.location.href = '/store');

    // Language popover
    if (langBtn && langPopover) {
      langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langPopover.classList.toggle('show');
      });
      document.addEventListener('click', (e) => {
        if (!document.getElementById('langContainer')?.contains(e.target)) {
          langPopover.classList.remove('show');
        }
      });
    }

    // Apply header translations using global translations object
    function applyHeaderTranslations() {
      const lang = window.currentLanguage || localStorage.getItem('language') || 'en';
      const t = window.translations?.header?.[lang];
      if (!t) return;
      if (storeBtn) storeBtn.textContent = t.storeBtn;
      const menuHome = document.getElementById('menuHome');
      const menuCommissions = document.getElementById('menuCommissions');
      const menuArtwork = document.getElementById('menuArtwork');
      const menuPoll = document.getElementById('menuPoll');
      const menuStore = document.getElementById('menuStore');
      const menuContact = document.getElementById('menuContact');
      const cartTitle = document.getElementById('cartTitle');
      const totalLabel = document.getElementById('totalLabel');
      const snackText = document.getElementById('snackText');
      if (menuHome) menuHome.textContent = t.menuHome;
      if (menuCommissions) menuCommissions.textContent = t.menuCommissions;
      if (menuArtwork) menuArtwork.textContent = t.menuArtwork;
      if (menuPoll) menuPoll.textContent = t.menuPoll;
      if (menuStore) menuStore.textContent = t.menuStore;
      if (menuContact) menuContact.textContent = t.menuContact;
      if (cartTitle) cartTitle.textContent = t.cartTitle;
      if (totalLabel) totalLabel.textContent = t.totalLabel;
      if (snackText) snackText.textContent = t.snackText;
    }

    document.addEventListener('languageChanged', () => {
      applyHeaderTranslations();
      updateCartDisplay();
    });

    applyHeaderTranslations();
    updateCartDisplay();
  } catch (err) {
    console.error('Failed to load header:', err);
  }
})();
