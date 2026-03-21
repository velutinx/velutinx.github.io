// top.js – Shared header & cart logic for VELUTINX
(function() {
  // --- Translation dictionary ---
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

  // --- State ---
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

  // Cart SVG icons
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

  // Language & theme
  function applyHeaderTranslations() {
    const t = translations[currentLang] || translations.en;
    document.getElementById('cartTitle').innerText = t.cartTitle;
    document.getElementById('totalLabel').innerText = t.totalLabel;
    document.getElementById('demoCheckoutBtn').innerText = t.checkoutBtn;
    document.getElementById('menuHome').innerText = t.menuHome;
    document.getElementById('menuCommissions').innerText = t.menuCommissions;
    document.getElementById('menuArtwork').innerText = t.menuArtwork;
    document.getElementById('menuPoll').innerText = t.menuPoll;
    document.getElementById('menuStore').innerText = t.menuStore;
    document.getElementById('menuContact').innerText = t.menuContact;
    const websiteBtn = document.getElementById('loginBtn');
    if (websiteBtn) websiteBtn.innerText = t.websiteBtn;
    updateCartUI();
  }

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    currentCurrency = lang === 'en' ? 'USD' : (lang === 'ja' ? 'JPY' : (lang === 'zh' ? 'CNY' : 'MXN'));
    applyHeaderTranslations();
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang, currency: currentCurrency } }));
    updateCartUI();
    if (window.updateAllPrices) window.updateAllPrices();
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

  // Inject header HTML
  async function loadHeader() {
    const placeholder = document.getElementById('header-placeholder');
    if (!placeholder) return;

    try {
      const response = await fetch('/assets/include/top.html');
      if (!response.ok) throw new Error('Failed to load header');
      const html = await response.text();
      placeholder.innerHTML = html;
      initializeComponents();
    } catch (err) {
      console.error('Header load error:', err);
      placeholder.innerHTML = '<div style="padding:1rem; text-align:center;">Failed to load header. Please refresh.</div>';
    }
  }

  function initializeComponents() {
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

    const demoBtn = document.getElementById('demoCheckoutBtn');
    if (demoBtn) demoBtn.addEventListener('click', () => alert("⚠️ Checkout is disabled in standalone demo. Cart items are stored locally."));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
  } else {
    loadHeader();
  }
})();
