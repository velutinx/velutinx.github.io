// ==================== GLOBAL HELPERS (available immediately) ====================
let currentLang = localStorage.getItem('language') || 'en';
let currentCurrency = currentLang === 'en' ? 'USD' :
                      currentLang === 'ja' ? 'JPY' :
                      currentLang === 'zh' ? 'CNY' : 'MXN';

let cart = JSON.parse(localStorage.getItem('velutinx_cart') || '[]');

// Price formatting constants
const tierMap = {
  1.5: { JPY: 250, CNY: 10.5, MXN: 24 },
  3.0: { JPY: 500, CNY: 21.0, MXN: 50 },
  10.0: { JPY: 1500, CNY: 69.0, MXN: 175 }
};
const approxRates = { JPY: 158, CNY: 6.9, MXN: 18 };

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

function getPriceForPack(pack) {
  return typeof pack.price === 'number' ? pack.price : parseFloat(pack.price) || 0;
}

function updateCartDisplay() {
  const count = cart.length;
  // FIXED: Ensure price is a number to prevent NaN
  const total = cart.reduce((sum, item) => sum + (typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0), 0);
  
  document.querySelectorAll('#cartCount, #floatingCartCount').forEach(el => {
    if (el) el.textContent = count;
  });
  
  const cartItemsEl = document.getElementById('cartItems');
  if (cartItemsEl) {
    cartItemsEl.innerHTML = count === 0 ? '<p>Your cart is empty</p>' : '';
    cart.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
      div.innerHTML = `
        <img src="${item.image || `https://www.velutinx.com/i/pack${String(item.id).padStart(3, '0')}-1.jpg`}" alt="${item.title}">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">${formatPrice(itemPrice)}</div>
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

function syncCartButtons() {
  const ids = new Set(cart.map(item => String(item.id)));
  document.querySelectorAll('.product-card').forEach(card => {
    const btn = card.querySelector('.cart-btn');
    if (btn) btn.classList.toggle('added', ids.has(String(card.dataset.id)));
  });
}

function showSnackbar(msg, isRemove = false) {
  const sb = document.getElementById('snackbar');
  const text = document.getElementById('snackText');
  const icon = sb?.querySelector('svg');
  if (!sb || !text || !icon) return;
  sb.classList.toggle('remove', isRemove);
  icon.innerHTML = isRemove
    ? `<path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="M20 6L9 17l-5-5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>`;
  text.textContent = msg;
  sb.classList.add('show');
  setTimeout(() => sb.classList.remove('show'), 2500);
}

// FIXED: Added missing logic to handle the actual "Add to Cart" click
window.addOrToggleCart = function(pack) {
    const idx = cart.findIndex(item => String(item.id) === String(pack.id));
    if (idx > -1) {
        cart.splice(idx, 1);
        showSnackbar('Removed from cart', true);
    } else {
        cart.push({
            id: pack.id,
            title: pack.title,
            price: getPriceForPack(pack),
            image: `https://www.velutinx.com/i/pack${String(pack.id).padStart(3, '0')}-1.jpg`
        });
        showSnackbar('Added successfully', false);
    }
    saveCart();
    updateCartDisplay();
    syncCartButtons();
};

// Expose globally for other scripts (including store page)
window.formatPrice = formatPrice;
window.getPriceForPack = getPriceForPack;
window.updateCartDisplay = updateCartDisplay;
window.syncCartButtons = syncCartButtons;
window.updateAllPrices = function() {
  document.querySelectorAll(".price").forEach(el => {
    const base = parseFloat(el.dataset.price);
    if (!isNaN(base)) el.innerHTML = formatPrice(base);
  });
};

// ==================== HEADER INJECTION (async) ====================
(async function() {
  const navContainer = document.getElementById('navContainer');
  if (!navContainer) return;

  try {
    const response = await fetch('/assets/includes/header.html');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
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

    // --- Cart drawer controls (with overlay) ---
    function openCart() {
      if (cartDrawer) cartDrawer.classList.add('open');
      cartOverlay.classList.add('active');
      document.body.classList.add('drawer-open');
    }
    function closeCart() {
      if (cartDrawer) cartDrawer.classList.remove('open');
      cartOverlay.classList.remove('active');
      document.body.classList.remove('drawer-open');
    }

    window.closeCartDrawer = closeCart;

    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (floatCartBtn) floatCartBtn.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Close drawer when clicking outside
    document.addEventListener('click', (e) => {
      if (cartDrawer?.classList.contains('open') &&
          !cartDrawer.contains(e.target) &&
          !cartBtn?.contains(e.target) &&
          !floatCartBtn?.contains(e.target)) {
        closeCart();
      }
    });

    // Remove item from cart (inside drawer)
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

      // Select items INSIDE the popover after injection
      langPopover.querySelectorAll('.lang-item').forEach(item => {
        item.addEventListener('click', () => {
          const newLang = item.dataset.lang;
          if (newLang) {
            localStorage.setItem('language', newLang);
            window.currentLanguage = newLang;
            // Trigger the site-wide sync
            document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: newLang } }));
          }
          langPopover.classList.remove('show');
        });
      });
    }

    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
      if (!document.getElementById('langContainer')?.contains(e.target)) {
        langPopover?.classList.remove('show');
      }
    });

    // --- Apply header translations ---
    function applyHeaderTranslations() {
      const lang = window.currentLanguage || localStorage.getItem('language') || 'en';
      const t = window.translations?.header?.[lang];
      if (!t) return;
      
      const transMap = {
        'storeBtn': 'textContent',
        'menuHome': 'textContent',
        'menuCommissions': 'textContent',
        'menuArtwork': 'textContent',
        'menuPoll': 'textContent',
        'menuStore': 'textContent',
        'menuContact': 'textContent',
        'cartTitle': 'textContent',
        'totalLabel': 'textContent',
        'snackText': 'textContent',
        'loginBtn': 'textContent'
      };

      Object.keys(transMap).forEach(id => {
        const el = document.getElementById(id);
        if (el && t[id]) el[transMap[id]] = t[id];
      });
    }

    // --- Language change handler ---
    document.addEventListener('languageChanged', () => {
      const lang = localStorage.getItem('language') || 'en';
      currentLang = lang;
      currentCurrency = lang === 'en' ? 'USD' :
                       lang === 'ja' ? 'JPY' :
                       lang === 'zh' ? 'CNY' : 'MXN';
      applyHeaderTranslations();
      updateCartDisplay();
      if (typeof window.updateAllPrices === 'function') window.updateAllPrices();
      // Force store page to translate if active
      if (typeof window.applyTranslations === 'function') window.applyTranslations('store');
    });

    // --- Initial setup ---
    applyHeaderTranslations();
    updateCartDisplay();
    syncCartButtons();

    // --- Notify that header and cart logic are ready ---
    window.dispatchEvent(new CustomEvent('headerReady'));

  } catch (err) {
    console.error('Failed to load header:', err);
    navContainer.innerHTML = '<div style="padding: 1rem; text-align: center; background: var(--bg);">Header failed to load. Please refresh the page.</div>';
  }
})();
