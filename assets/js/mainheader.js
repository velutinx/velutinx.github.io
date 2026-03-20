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

    // --- Price formatting constants (store) ---
    const tierMap = { 
      1.5: { JPY: 250, CNY: 10.5, MXN: 25 }, 
      3.0: { JPY: 500, CNY: 21.0, MXN: 50 }, 
      10.0: { JPY: 1500, CNY: 69.0, MXN: 175 } 
    };
    const approxRates = { JPY: 158, CNY: 6.9, MXN: 18 };

    // Current currency – initialise from stored language
    let currentLang = localStorage.getItem('language') || 'en';
    let currentCurrency = currentLang === 'en' ? 'USD' :
                         currentLang === 'ja' ? 'JPY' :
                         currentLang === 'zh' ? 'CNY' : 'MXN';

    // --- Cart state (from localStorage) ---
    let cart = JSON.parse(localStorage.getItem('velutinx_cart') || '[]');

    // --- Helper functions ---
    function showSnackbar(msg, isRemove = false) {
      const sb = document.getElementById('snackbar');
      const text = document.getElementById('snackText');
      const icon = sb?.querySelector('svg');
      if (!sb || !text || !icon) return;
      sb.classList.toggle('remove', isRemove);
      icon.innerHTML = isRemove
        ? `<path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<path d="M20 6L9 17l-5-5"></path>`;
      text.textContent = msg;
      sb.classList.add('show');
      setTimeout(() => sb.classList.remove('show'), 2500);
    }

    function formatPrice(value, currency = currentCurrency) {
      if (currency === "USD") return `US$${value.toFixed(2)}`;
      const rounded = Math.round(value * 100) / 100;
      if (tierMap[rounded] && tierMap[rounded][currency] !== undefined) {
        const converted = tierMap[rounded][currency];
        const symbol = currency === "JPY" ? "円" : currency === "CNY" ? "元" : "MXN$";
        return `${symbol}${converted}`;
      }
      let converted = value * (approxRates[currency] || 1);
      converted = (currency === "JPY" || currency === "MXN") ? Math.ceil(converted) : Math.ceil(converted * 10) / 10;
      const symbol = currency === "JPY" ? "円" : currency === "CNY" ? "元" : "MXN$";
      return `${symbol}${converted}`;
    }

    function updateCartDisplay() {
      const count = cart.length;
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      document.querySelectorAll('#cartCount, #floatingCartCount').forEach(el => {
        if (el) el.textContent = count;
      });
      if (cartItemsEl) {
        cartItemsEl.innerHTML = count === 0 ? '<p>Your cart is empty</p>' : '';
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
        const totalEl = document.getElementById('cartTotal');
        if (totalEl) totalEl.textContent = formatPrice(total);
      }
    }

    function saveCart() {
      localStorage.setItem('velutinx_cart', JSON.stringify(cart));
    }

    function getPriceForPack(pack) {
      return typeof pack.price === 'number' ? pack.price : parseFloat(pack.price) || 0;
    }

    // Global function for adding/removing items
    window.addOrToggleCart = function(pack) {
      const index = cart.findIndex(item => item.id === pack.id);
      const isAdding = index === -1;
      const card = document.querySelector(`.product-card[data-id="${pack.id}"]`);
      const btn = card?.querySelector('.cart-btn');

      // Generate image URL from pack.id if not provided
      let imageUrl = pack.image || (pack.images?.[0] ?? '');
      if (!imageUrl) {
        const paddedId = String(pack.id).padStart(3, '0');
        imageUrl = `https://www.velutinx.com/i/pack${paddedId}-1.jpg`;
      }

      if (isAdding) {
        cart.push({
          id: pack.id,
          title: pack.title,
          image: imageUrl,
          price: getPriceForPack(pack),
          quantity: 1
        });
        btn?.classList.add('added');
        const t = window.translations?.header?.[currentLang] || { snackText: 'Added successfully' };
        showSnackbar(t.snackText || 'Added successfully', false);
      } else {
        cart.splice(index, 1);
        btn?.classList.remove('added');
        showSnackbar('Removed from cart', true);
      }

      saveCart();
      updateCartDisplay();
      syncCartButtons();
    };

    function syncCartButtons() {
      const ids = new Set(cart.map(item => item.id));
      document.querySelectorAll('.product-card').forEach(card => {
        const btn = card.querySelector('.cart-btn');
        if (btn) btn.classList.toggle('added', ids.has(card.dataset.id));
      });
    }

    // --- Cart drawer controls (with overlay) ---
    function openCart() {
      cartDrawer.classList.add('open');
      cartOverlay.classList.add('active');
      document.body.classList.add('drawer-open');
    }
    function closeCart() {
      cartDrawer.classList.remove('open');
      cartOverlay.classList.remove('active');
      document.body.classList.remove('drawer-open');
    }

    if (cartBtn && floatCartBtn && cartClose && cartDrawer) {
      cartBtn.addEventListener('click', openCart);
      floatCartBtn.addEventListener('click', openCart);
      cartClose.addEventListener('click', closeCart);
      cartOverlay.addEventListener('click', closeCart);
    }

    // Close drawer when clicking outside (but not inside)
    document.addEventListener('click', (e) => {
      if (cartDrawer?.classList.contains('open') &&
          !cartDrawer.contains(e.target) &&
          !cartBtn?.contains(e.target) &&
          !floatCartBtn?.contains(e.target)) {
        closeCart();
      }
    });

    // Remove item from cart (inside drawer) – drawer stays open
    if (cartItemsEl) {
      cartItemsEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('cart-item-remove')) {
          e.stopPropagation();
          e.preventDefault();
          const idx = parseInt(e.target.dataset.idx);
          if (!isNaN(idx) && idx >= 0 && idx < cart.length) {
            cart.splice(idx, 1);
            saveCart();
            updateCartDisplay();
            syncCartButtons();
            showSnackbar('Removed from cart', true);
          }
        }
      });
    }

    // --- Sidebar toggle ---
    function openSidebar() {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
    if (menuToggle && sidebarMenuToggle && sidebarOverlay) {
      menuToggle.addEventListener('click', openSidebar);
      sidebarMenuToggle.addEventListener('click', closeSidebar);
      sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // --- Theme toggle ---
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('darkMode', document.body.classList.contains('dark'));
      });
      if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
      }
    }

    // --- Store button redirect ---
    if (storeBtn) storeBtn.addEventListener('click', () => window.location.href = '/store');

    // --- Language popover ---
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

    // --- Apply header translations ---
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

    // --- Language change handler (update currency and prices) ---
    document.addEventListener('languageChanged', () => {
      const lang = window.currentLanguage || localStorage.getItem('language') || 'en';
      currentLang = lang;
      currentCurrency = lang === 'en' ? 'USD' :
                       lang === 'ja' ? 'JPY' :
                       lang === 'zh' ? 'CNY' : 'MXN';
      applyHeaderTranslations();
      updateCartDisplay();
      // Also update product prices if the store page is loaded
      if (typeof window.updateAllPrices === 'function') window.updateAllPrices();
    });

    // --- Language item clicks ---
    document.querySelectorAll('.lang-item').forEach(item => {
      item.addEventListener('click', () => {
        const newLang = item.dataset.lang;
        if (window.setLanguage) window.setLanguage(newLang);
        langPopover?.classList.remove('show');
      });
    });

    // --- Expose global functions for store page ---
    window.updateAllPrices = function() {
      document.querySelectorAll(".price").forEach(el => {
        const base = parseFloat(el.dataset.price);
        if (!isNaN(base)) el.innerHTML = formatPrice(base);
      });
    };
    window.syncCartButtons = syncCartButtons;
    window.updateCartDisplay = updateCartDisplay;
    window.getPriceForPack = getPriceForPack;

    // --- Apply store translations if the page is the store ---
    if (document.getElementById('shopTitle')) {
      // The store page is loaded – apply its translations
      if (typeof window.applyTranslations === 'function') {
        window.applyTranslations('store');
      }
    }

    // --- Initial setup ---
    applyHeaderTranslations();
    updateCartDisplay();
    syncCartButtons(); // for any existing cart buttons (if store page already loaded)

    // --- Notify that header and cart logic are ready ---
    window.dispatchEvent(new CustomEvent('headerReady'));

  } catch (err) {
    console.error('Failed to load header:', err);
  }
})();
