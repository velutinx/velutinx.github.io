// top.js - shared header, cart, sidebar, language, theme, snackbar logic

const translations = {
  en: {
    cartTitle: "Shopping Cart",
    totalLabel: "Total",
    emptyCart: "Your cart is empty",
    addedMsg: "Added successfully",
    removedMsg: "Removed from cart",
    checkoutBtn: "Proceed to checkout (DEMO)",
    websiteBtn: "Website",
    menuHome: "HOME",
    menuCommissions: "COMMISSIONS",
    menuArtwork: "ARTWORK",
    menuPoll: "POLL",
    menuStore: "STORE",
    menuContact: "CONTACT"
  },
  ja: {
    cartTitle: "ショッピングカート",
    totalLabel: "合計",
    emptyCart: "カートは空です",
    addedMsg: "カートに追加しました",
    removedMsg: "カートから削除しました",
    checkoutBtn: "レジに進む (デモ)",
    websiteBtn: "ウェブサイト",
    menuHome: "ホーム",
    menuCommissions: "コミッション",
    menuArtwork: "アートワーク",
    menuPoll: "投票",
    menuStore: "ストア",
    menuContact: "お問い合わせ"
  },
  zh: {
    cartTitle: "购物车",
    totalLabel: "总计",
    emptyCart: "购物车是空的",
    addedMsg: "已添加到购物车",
    removedMsg: "已从购物车移除",
    checkoutBtn: "去结账 (演示)",
    websiteBtn: "网站",
    menuHome: "主页",
    menuCommissions: "委托",
    menuArtwork: "作品集",
    menuPoll: "投票",
    menuStore: "商店",
    menuContact: "联系"
  },
  es: {
    cartTitle: "Carrito de Compras",
    totalLabel: "Total",
    emptyCart: "Tu carrito está vacío",
    addedMsg: "Añadido correctamente",
    removedMsg: "Eliminado del carrito",
    checkoutBtn: "Proceder al pago (DEMO)",
    websiteBtn: "Sitio web",
    menuHome: "INICIO",
    menuCommissions: "COMISIONES",
    menuArtwork: "OBRAS",
    menuPoll: "ENCUESTA",
    menuStore: "TIENDA",
    menuContact: "CONTACTO"
  }
};

let cart = JSON.parse(localStorage.getItem('velutinx_cart') || '[]');
let currentLang = localStorage.getItem('language') || 'en';

const STATIC_USD = 3.0;

function formatPrice(usd = STATIC_USD) {
  if (currentLang === 'en') return `US$${usd.toFixed(2)}`;
  if (currentLang === 'ja') return `円${Math.round(usd * 158)}`;
  if (currentLang === 'zh') return `元${(usd * 6.9).toFixed(1)}`;
  if (currentLang === 'es') return `MXN$${Math.round(usd * 18)}`;
  return `$${usd.toFixed(2)}`;
}

function saveCart() {
  localStorage.setItem('velutinx_cart', JSON.stringify(cart));
  document.querySelectorAll('#cartCount, #floatingCartCount').forEach(el => {
    if (el) el.textContent = cart.length;
  });
}

function showSnack(msg, isRemove = false) {
  const sb = document.getElementById('snackbar');
  if (!sb) return;
  document.getElementById('snackText').textContent = msg;
  sb.style.background = isRemove ? '#ef4444' : '#22c55e';
  sb.classList.add('show');
  setTimeout(() => sb.classList.remove('show'), 2200);
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
      image: `https://velutinx.com/i/pack${String(product.id).padStart(3,'0')}-1.jpg`
    });
    showSnack(t.addedMsg);
  }

  saveCart();
  updateCartDrawer();
};

function updateCartDrawer() {
  const container = document.getElementById('cartItems');
  if (!container) return;

  const t = translations[currentLang] || translations.en;
  container.innerHTML = cart.length === 0
    ? `<div style="padding:1rem;text-align:center;color:var(--gray);">${t.emptyCart}</div>`
    : '';

  cart.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.image}" alt="${item.title}" onerror="this.src='https://placehold.co/70x70?text=?'">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title}</div>
        <div>${formatPrice(item.price)}</div>
      </div>
      <button class="cart-item-remove" data-idx="${idx}">✕</button>
    `;
    container.appendChild(div);
  });

  document.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      cart.splice(idx, 1);
      saveCart();
      updateCartDrawer();
      showSnack(t.removedMsg, true);
    });
  });

  document.getElementById('cartTotal').textContent = formatPrice(
    cart.reduce((sum, i) => sum + i.price, 0)
  );
}

function applyTranslations() {
  const t = translations[currentLang] || translations.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });
  document.getElementById('loginBtn') && (document.getElementById('loginBtn').textContent = t.websiteBtn);
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);
  applyTranslations();
  updateCartDrawer(); // refresh prices
  document.getElementById('languagePopover')?.classList.remove('show');
}

// ── Drawer logic ────────────────────────────────────────────────────────────────
function initDrawers() {
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');

  const openCart = () => {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('active');
    document.body.classList.add('drawer-open');
    updateCartDrawer();
  };

  const closeCart = () => {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('active');
    document.body.classList.remove('drawer-open');
  };

  document.getElementById('cartBtn')?.addEventListener('click', openCart);
  document.getElementById('floatingCartBtn')?.addEventListener('click', openCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  // Sidebar
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  document.getElementById('menuToggle')?.addEventListener('click', () => {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
    document.body.classList.add('drawer-open');
  });

  document.getElementById('sidebarMenuToggle')?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    document.body.classList.remove('drawer-open');
  });

  sidebarOverlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    document.body.classList.remove('drawer-open');
  });
}

// ── Language & Theme ────────────────────────────────────────────────────────────
function initLanguage() {
  const btn = document.getElementById('langBtn');
  const pop = document.getElementById('languagePopover');
  if (!btn || !pop) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    pop.classList.toggle('show');
  });

  pop.querySelectorAll('.lang-item').forEach(item => {
    item.addEventListener('click', () => setLanguage(item.dataset.lang));
  });

  document.addEventListener('click', e => {
    if (!pop.contains(e.target) && e.target !== btn) pop.classList.remove('show');
  });
}

function initTheme() {
  const btn = document.getElementById('themeBtn');
  if (!btn) return;

  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
  }

  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
  });
}

// ── Init everything on load ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  saveCart();           // update badge count
  applyTranslations();
  initDrawers();
  initLanguage();
  initTheme();

  document.getElementById('demoCheckoutBtn')?.addEventListener('click', () => {
    alert("Checkout is a demo only. Items are stored in localStorage.");
  });
});
