// shared.js – Injects header, sidebar, cart, etc. into any page.
(function() {
  // --------------------------------------------------------------
  // 1. Translation dictionary (for header, cart, sidebar)
  // --------------------------------------------------------------
  const translations = {
    en: {
      cartTitle: "Shopping Cart", totalLabel: "Total", emptyCart: "Your cart is empty",
      addedMsg: "Added successfully", removedMsg: "Removed from cart",
      checkoutBtn: "Proceed to checkout (DEMO)", menuHome: "HOME", menuCommissions: "COMMISSIONS",
      menuArtwork: "ARTWORK", menuPoll: "POLL", menuStore: "STORE", menuContact: "CONTACT",
      websiteBtn: "Website"
    },
    ja: {
      cartTitle: "ショッピングカート", totalLabel: "合計", emptyCart: "カートは空です",
      addedMsg: "カートに追加しました", removedMsg: "カートから削除しました",
      checkoutBtn: "レジに進む (デモ)", menuHome: "ホーム", menuCommissions: "コミッション",
      menuArtwork: "アートワーク", menuPoll: "投票", menuStore: "ストア", menuContact: "お問い合わせ",
      websiteBtn: "ウェブサイト"
    },
    zh: {
      cartTitle: "购物车", totalLabel: "总计", emptyCart: "购物车是空的",
      addedMsg: "已添加到购物车", removedMsg: "已从购物车移除",
      checkoutBtn: "去结账 (演示)", menuHome: "主页", menuCommissions: "委托",
      menuArtwork: "作品集", menuPoll: "投票", menuStore: "商店", menuContact: "联系",
      websiteBtn: "网站"
    },
    es: {
      cartTitle: "Carrito de Compras", totalLabel: "Total", emptyCart: "Tu carrito está vacío",
      addedMsg: "Añadido correctamente", removedMsg: "Eliminado del carrito",
      checkoutBtn: "Proceder al pago (DEMO)", menuHome: "INICIO", menuCommissions: "COMISIONES",
      menuArtwork: "OBRAS", menuPoll: "ENCUESTA", menuStore: "TIENDA", menuContact: "CONTACTO",
      websiteBtn: "Sitio web"
    }
  };

  // --------------------------------------------------------------
  // 2. Cart state & helpers
  // --------------------------------------------------------------
  let cart = JSON.parse(localStorage.getItem('velutinx_cart') || '[]');
  let currentLang = localStorage.getItem('language') || 'en';
  let currentCurrency = currentLang === 'en' ? 'USD' : (currentLang === 'ja' ? 'JPY' : (currentLang === 'zh' ? 'CNY' : 'MXN'));
  const STATIC_USD = 3.0;
  const tierMap = { 3.0: { JPY: 500, CNY: 21.0, MXN: 50 } };
  const approxRates = { JPY: 158, CNY: 6.9, MXN: 18 };

  window.formatPrice = function(usd = STATIC_USD, currency = currentCurrency) {
    if (currency === "USD") return `US$${usd.toFixed(2)}`;
    const exact = tierMap[usd]?.[currency];
    if (exact !== undefined) {
      const sym = currency === "JPY" ? "円" : currency === "CNY" ? "元" : "MXN$";
      return `${sym}${exact}`;
    }
    let converted = usd * (approxRates[currency] || 1);
    converted = (currency === "JPY" || currency === "MXN") ? Math.ceil(converted) : Math.ceil(converted * 10) / 10;
    const sym = currency === "JPY" ? "円" : currency === "CNY" ? "元" : "MXN$";
    return `${sym}${converted}`;
  };

  // Cart icons (add/remove) for product cards
  const addSvg = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 3H4.5L6.5 15H19L21 7H8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="9" cy="20" r="2" stroke="white" stroke-width="2"/>
    <circle cx="17" cy="20" r="2" stroke="white" stroke-width="2"/>
    <circle cx="18" cy="7" r="5" fill="#2ecc71"/>
    <path d="M18 5V9M16 7H20" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;
  const removeSvg = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 3H4.5L6.5 15H19L21 7H8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="9" cy="20" r="2" stroke="white" stroke-width="2"/>
    <circle cx="17" cy="20" r="2" stroke="white" stroke-width="2"/>
    <circle cx="18" cy="7" r="5" fill="#e74c3c"/>
    <path d="M16 7H20" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;

  function saveCart() {
    localStorage.setItem('velutinx_cart', JSON.stringify(cart));
    updateCartUI();
    if (window.syncCartButtons) window.syncCartButtons();
  }

  function updateCartUI() {
    const count = cart.length;
    const total = cart.reduce((s, i) => s + STATIC_USD, 0);
    document.querySelectorAll('#cartCount, #floatingCartCount').forEach(el => { if (el) el.textContent = count; });
    const container = document.getElementById('cartItems');
    const t = translations[currentLang] || translations.en;
    if (container) {
      container.innerHTML = cart.length === 0 ? `<div style="padding:1rem;">${t.emptyCart}</div>` : '';
      cart.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `<img src="${item.image}" alt="${item.title}"><div class="cart-item-info"><div class="cart-item-title">${item.title}</div><div class="cart-item-price">${window.formatPrice(STATIC_USD)}</div></div><button class="cart-item-remove" data-idx="${idx}">✕</button>`;
        container.appendChild(div);
      });
      document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(btn.dataset.idx);
          cart.splice(idx, 1);
          saveCart();
          showSnack(t.removedMsg, true);
        });
      });
      document.getElementById('cartTotal').innerText = window.formatPrice(total);
    }
  }

  function showSnack(msg, isRemove = false) {
    const sb = document.getElementById('snackbar');
    const text = document.getElementById('snackText');
    if (sb) {
      sb.style.background = isRemove ? '#ef4444' : '#22c55e';
      text.innerText = msg;
      sb.classList.add('show');
      setTimeout(() => sb.classList.remove('show'), 2000);
    }
  }

  window.addOrToggleCart = function(product) {
    const t = translations[currentLang] || translations.en;
    const idx = cart.findIndex(i => String(i.id) === String(product.id));
    if (idx > -1) {
      cart.splice(idx, 1);
      showSnack(t.removedMsg, true);
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: STATIC_USD,
        image: `https://www.velutinx.com/i/pack${String(product.id).padStart(3, '0')}-1.jpg`
      });
      showSnack(t.addedMsg, false);
    }
    saveCart();
    updateCartUI();
    if (window.syncCartButtons) window.syncCartButtons();
  };

  window.syncCartButtons = function() {
    const idsInCart = new Set(cart.map(i => String(i.id)));
    document.querySelectorAll('.product-card').forEach(card => {
      const btn = card.querySelector('.cart-btn');
      if (!btn) return;
      const inCart = idsInCart.has(card.dataset.id);
      if (inCart) {
        btn.classList.add('added');
        btn.innerHTML = removeSvg;
      } else {
        btn.classList.remove('added');
        btn.innerHTML = addSvg;
      }
    });
  };

  // --------------------------------------------------------------
  // 3. Language & theme
  // --------------------------------------------------------------
  function applyHeaderTranslations() {
    const t = translations[currentLang] || translations.en;
    const cartTitleEl = document.getElementById('cartTitle');
    if (cartTitleEl) cartTitleEl.innerText = t.cartTitle;
    const totalLabelEl = document.getElementById('totalLabel');
    if (totalLabelEl) totalLabelEl.innerText = t.totalLabel;
    const checkoutBtn = document.getElementById('demoCheckoutBtn');
    if (checkoutBtn) checkoutBtn.innerText = t.checkoutBtn;
    const menuHome = document.getElementById('menuHome');
    if (menuHome) menuHome.innerText = t.menuHome;
    const menuCommissions = document.getElementById('menuCommissions');
    if (menuCommissions) menuCommissions.innerText = t.menuCommissions;
    const menuArtwork = document.getElementById('menuArtwork');
    if (menuArtwork) menuArtwork.innerText = t.menuArtwork;
    const menuPoll = document.getElementById('menuPoll');
    if (menuPoll) menuPoll.innerText = t.menuPoll;
    const menuStore = document.getElementById('menuStore');
    if (menuStore) menuStore.innerText = t.menuStore;
    const menuContact = document.getElementById('menuContact');
    if (menuContact) menuContact.innerText = t.menuContact;
    const websiteBtn = document.getElementById('loginBtn');
    if (websiteBtn) websiteBtn.innerText = t.websiteBtn;
    updateCartUI();
  }

  // Corrected setLanguage function – properly closed, dispatches event
  function setLanguage(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem('language', lang);
    currentCurrency = lang === 'en' ? 'USD' : (lang === 'ja' ? 'JPY' : (lang === 'zh' ? 'CNY' : 'MXN'));
    applyHeaderTranslations();
    updateCartUI();

    // Sync with translt.js
    if (typeof window.syncLanguage === 'function') {
      window.syncLanguage(lang);
    }

    // Dispatch event for the whole page
    document.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: lang, currency: currentCurrency }
    }));
  }

  function initTheme() {
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('darkMode', document.body.classList.contains('dark'));
      });
    }
    if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark');
  }

  // --------------------------------------------------------------
  // 4. Header HTML (embedded as a string – exactly from your working page)
  // --------------------------------------------------------------
  const headerHTML = `
<nav class="top-nav">
  <div class="nav-left">
    <button class="menu-toggle" id="menuToggle" aria-label="Menu">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
    <div class="logo">VELUTINX</div>
  </div>
  <div class="nav-actions">
    <a href="https://velutinx.com/index-" class="login-btn" id="loginBtn">Website</a>
    <div id="langContainer" style="position:relative">
      <button class="nav-icon" id="langBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 5h7"></path><path d="M7 4c0 4.846 0 7 .5 8"></path><path d="M10 8.5c0 2.286 -2 4.5 -3.5 4.5s-2.5 -1.135 -2.5 -2c0 -2 1 -3 3 -3s5 .57 5 2.857c0 1.524 -.667 2.571 -2 3.143"></path><path d="M12 20l4 -9l4 9"></path><path d="M19.1 18h-6.2"></path></svg>
      </button>
      <div id="languagePopover">
        <div class="lang-item" data-lang="en"><img src="https://flagcdn.com/w40/us.png" alt="en">English</div>
        <div class="lang-item" data-lang="ja"><img src="https://flagcdn.com/w40/jp.png" alt="ja">日本語</div>
        <div class="lang-item" data-lang="zh"><img src="https://flagcdn.com/w40/cn.png" alt="zh">简体中文</div>
        <div class="lang-item" data-lang="es"><img src="https://flagcdn.com/w40/mx.png" alt="es">Español</div>
      </div>
    </div>
    <button class="nav-icon" id="themeBtn">
      <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"></path></svg>
    </button>
    <div class="cart-wrapper" style="position:relative">
      <button class="nav-icon" id="cartBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path><path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path><path d="M17 17h-11v-14h-2"></path><path d="M6 5l14 1l-.86 6.017m-2.64 .983h-10.5"></path><path d="M16 19h6"></path><path d="M19 16v6"></path></svg>
      </button>
      <span class="cart-badge" id="cartCount">0</span>
    </div>
  </div>
</nav>

<button class="floating-cart" id="floatingCartBtn">
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path><path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path><path d="M17 17h-11v-14h-2"></path><path d="M6 5l14 1l-1 7h-13"></path></svg>
  <span class="floating-badge" id="floatingCartCount">0</span>
</button>

<div class="sidebar-overlay" id="sidebarOverlay"></div>
<aside class="sidebar" id="sidebar">
  <div class="sidebar-header">
    <button class="menu-toggle" id="sidebarMenuToggle" style="background:transparent; color:var(--text);">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
    <div class="logo">VELUTINX</div>
  </div>
  <div class="sidebar-menu">
    <a href="https://velutinx.com/index-" class="menu-item"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9L12 3L21 9L12 15L3 9Z"/><path d="M5 12v6h14v-6"/></svg><span id="menuHome">HOME</span></a>
    <a href="https://velutinx.com/commission" class="menu-item"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg><span id="menuCommissions">COMMISSIONS</span></a>
    <a href="https://velutinx.com/artwork" class="menu-item"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M7 7l2 2M17 7l-2 2M7 17l2-2M17 17l-2-2"/></svg><span id="menuArtwork">ARTWORK</span></a>
    <a href="https://velutinx.com/poll" class="menu-item"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/><path d="M16 4v16"/></svg><span id="menuPoll">POLL</span></a>
    <a href="https://velutinx.com/store" class="menu-item"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9L12 3L21 9L12 15L3 9Z"/><path d="M5 12v6h14v-6"/><circle cx="12" cy="15" r="2"/></svg><span id="menuStore">STORE</span></a>
    <a href="https://velutinx.com/contact" class="menu-item"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16v12H4z"/><path d="M22 6L12 13L2 6"/></svg><span id="menuContact">CONTACT</span></a>
  </div>
  <div class="sidebar-footer">© VELUTINX</div>
</aside>

<div class="cart-overlay" id="cartOverlay"></div>
<div class="cart-drawer" id="cartDrawer">
  <div class="cart-header"><h5 id="cartTitle">Shopping Cart</h5><button class="cart-close" id="cartClose">×</button></div>
  <div class="cart-items" id="cartItems"></div>
  <div class="cart-total"><span id="totalLabel">Total</span><span id="cartTotal">US$0.00</span></div>
<div id="paypal-button-container" style="margin: 12px 20px 20px;"></div>
</div>

<div id="snackbar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg><span id="snackText">Added successfully</span></div>
`;

  // --------------------------------------------------------------
  // 5. Inject header and set up event listeners
  // --------------------------------------------------------------
  function injectHeader() {
    const placeholder = document.getElementById('header-placeholder');
    if (!placeholder) {
      console.error('Header placeholder missing: add <div id="header-placeholder"></div> to your page.');
      return;
    }
    placeholder.innerHTML = headerHTML;

    // Now the DOM elements exist, so we can attach event listeners
    applyHeaderTranslations();
    updateCartUI();

    // Sidebar toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarClose = document.getElementById('sidebarMenuToggle');
    if (menuToggle && sidebar && sidebarOverlay) {
      menuToggle.onclick = () => {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      };
      const closeSide = () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
      };
      sidebarClose?.addEventListener('click', closeSide);
      sidebarOverlay.addEventListener('click', closeSide);
    }

    // Cart drawer
    const cartBtn = document.getElementById('cartBtn');
    const floatCartBtn = document.getElementById('floatingCartBtn');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');

    const openCart = () => {
      cartDrawer.classList.add('open');
      cartOverlay.classList.add('active');
      document.body.classList.add('drawer-open');
      renderPayPalButton();
    };
    const closeCart = () => {
      cartDrawer.classList.remove('open');
      cartOverlay.classList.remove('active');
      document.body.classList.remove('drawer-open');
    };

    cartBtn?.addEventListener('click', openCart);
    floatCartBtn?.addEventListener('click', openCart);
    cartClose?.addEventListener('click', closeCart);
    cartOverlay?.addEventListener('click', closeCart);

    // Language popover
    const langBtn = document.getElementById('langBtn');
    const pop = document.getElementById('languagePopover');
    if (langBtn && pop) {
      langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        pop.classList.toggle('show');
      });
      document.querySelectorAll('.lang-item').forEach(item => {
        item.addEventListener('click', () => {
          const lang = item.dataset.lang;
          if (lang) setLanguage(lang);
          pop.classList.remove('show');
        });
      });
      document.addEventListener('click', (e) => {
        if (!pop.contains(e.target) && e.target !== langBtn) pop.classList.remove('show');
      });
    }

    initTheme();

    // ----- PayPal checkout support -----
    window.setupStoreCheckout = function(getCartItems, onSuccess) {
      window._storeGetCartItems = getCartItems;
      window._storeOnSuccess = onSuccess;
      if (cartDrawer.classList.contains('open')) {
        renderPayPalButton();
      }
    };

    function renderPayPalButton() {
      const container = document.getElementById('paypal-button-container');
      if (!container) return;
      container.innerHTML = '';

      const getItems = window._storeGetCartItems || (() => cart.map(item => ({ priceKey: item.priceKey, quantity: 1 })));
      const items = getItems();
      if (items.length === 0) {
        container.innerHTML = '<p style="text-align:center; margin-top:1rem;">Add items to checkout</p>';
        return;
      }

      async function createOrder() {
        const response = await fetch('https://velutinx-paypal-worker.velutinx.workers.dev', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart: items })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Order creation failed');
        return data.orderID;
      }

      paypal.Buttons({
        createOrder,
        onApprove: (data, actions) => {
          return actions.order.capture().then(() => {
            if (window._storeOnSuccess) window._storeOnSuccess();
            updateCartUI();
            alert('Payment successful! Your order will be processed.');
          });
        },
        onError: (err) => {
          console.error('PayPal error', err);
          alert('Something went wrong. Please try again.');
        }
      }).render(container);
    }

    // Re-render PayPal button on language change only if drawer is open
    const originalSetLanguage = setLanguage;
    window.setLanguage = function(lang) {
      originalSetLanguage(lang);
      if (cartDrawer.classList.contains('open')) {
        renderPayPalButton();
      }
    };
    // Expose setLanguage globally (already done above, but keep for clarity)
    window.setLanguage = setLanguage;

    // Update cart UI and refresh PayPal if drawer is open
    const originalUpdateCartUI = updateCartUI;
    updateCartUI = function() {
      originalUpdateCartUI();
      if (cartDrawer.classList.contains('open')) {
        renderPayPalButton();
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHeader);
  } else {
    injectHeader();
  }
})();
