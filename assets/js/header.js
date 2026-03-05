const translations = { /* same as before - copy from your original script */ 
  en: { /* ... */ }, ja: { /* ... */ }, zh: { /* ... */ }, es: { /* ... */ }
};

const tierMap = { 1.5: { JPY: 250, CNY: 10.5, MXN: 25 }, 3.0: { JPY: 500, CNY: 21.0, MXN: 50 }, 10.0: { JPY: 1500, CNY: 69.0, MXN: 175 } };
const approxRates = { JPY: 158, CNY: 6.9, MXN: 18 };

let currentLang = localStorage.getItem("language") || "en";
let currentCurrency = currentLang === "en" ? "USD" : currentLang === "ja" ? "JPY" : currentLang === "zh" ? "CNY" : "MXN";
window.cart = [];
let isDark = localStorage.getItem("darkMode") === "true";
let realTotalUSD = 0;

if (isDark) document.body.classList.add("dark");

function formatPrice(value, currency) { /* same as your original */ 
  /* ... copy the whole function ... */
}

function updateAllPrices() {
  document.querySelectorAll(".price").forEach(el => {
    const base = parseFloat(el.dataset.price);
    const orig = parseFloat(el.dataset.original);
    let html = formatPrice(base, currentCurrency);
    if (orig && orig > base) html += ` <del>${formatPrice(orig, currentCurrency)}</del>`;
    el.innerHTML = html;
  });
}

function setLanguage(lang) {
  if (currentLang === lang) return;
  currentLang = lang;
  currentCurrency = lang === "en" ? "USD" : lang === "ja" ? "JPY" : lang === "zh" ? "CNY" : "MXN";
  localStorage.setItem("language", lang);

  // Swipe animation
  const swipe = document.getElementById("langSwipe");
  swipe.classList.remove("active");
  void swipe.offsetHeight;
  swipe.classList.add("active");

  const t = translations[lang] || translations.en;
  // Update all shop texts (safe if IDs don't exist on other pages)
  const ids = ["shopTitle","filterTitle","catAll","catNot","catFrom","catSisters","sortTitle","sortDefault","sortNewest","sortLow","sortHigh","resetBtn","productsTitle","cartTitle","totalLabel","snackText","loginBtn"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && t[id]) el.textContent = t[id];
  });
  if (document.getElementById("searchInput")) document.getElementById("searchInput").placeholder = t.searchPlaceholder;

  updateAllPrices();
  updateCartDisplay();

  // Notify other pages
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang, currency: currentCurrency } }));
}

function updateCartDisplay() {
  const count = window.cart.length;
  document.getElementById("cartCount").textContent = count;
  document.getElementById("floatingCartCount").textContent = count;

  const cartItemsEl = document.getElementById("cartItems");
  cartItemsEl.innerHTML = "";
  realTotalUSD = 0;

  window.cart.forEach((item, idx) => {
    realTotalUSD += item.price;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.title}">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-price">${formatPrice(item.price, currentCurrency)}</div>
      </div>
      <button class="cart-item-remove" data-idx="${idx}">×</button>
    `;
    cartItemsEl.appendChild(div);
  });

  document.getElementById("cartTotal").textContent = formatPrice(realTotalUSD, currentCurrency);

  const active = count > 0;
  [document.getElementById("cartBtn"), document.getElementById("floatingCartBtn")].forEach(b => b.classList.toggle("active", active));
}

function toggleTheme() {
  isDark = !isDark;
  document.body.classList.toggle("dark", isDark);
  localStorage.setItem("darkMode", isDark);
}

/* ==================== INIT ==================== */
document.addEventListener("DOMContentLoaded", () => {
  const langBtn = document.getElementById("langBtn");
  const langContainer = document.getElementById("langContainer");
  const popover = document.getElementById("languagePopover");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartClose = document.getElementById("cartClose");
  const themeBtn = document.getElementById("themeBtn");

  // Language
  langBtn.addEventListener("click", e => {
    e.stopPropagation();
    popover.classList.toggle("show");
  });
  document.addEventListener("click", e => {
    if (!langContainer.contains(e.target)) popover.classList.remove("show");
  });
  document.querySelectorAll(".lang-item").forEach(item => {
    item.addEventListener("click", () => {
      setLanguage(item.dataset.lang);
      popover.classList.remove("show");
    });
  });

  // Theme
  themeBtn.addEventListener("click", toggleTheme);

  // Cart drawer
  const openCart = () => {
    cartDrawer.classList.add("open");
    document.body.classList.add("drawer-open");
  };
  const closeCart = () => {
    cartDrawer.classList.remove("open");
    document.body.classList.remove("drawer-open");
  };
  document.getElementById("cartBtn").addEventListener("click", openCart);
  document.getElementById("floatingCartBtn").addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);

  document.addEventListener("click", e => {
    if (cartDrawer.classList.contains("open") && !cartDrawer.contains(e.target) &&
        !document.getElementById("cartBtn").contains(e.target) &&
        !document.getElementById("floatingCartBtn").contains(e.target)) {
      closeCart();
    }
  });

  // Cart item remove
  document.getElementById("cartItems").addEventListener("click", e => {
    if (e.target.classList.contains("cart-item-remove")) {
      const idx = parseInt(e.target.dataset.idx);
      window.cart.splice(idx, 1);
      updateCartDisplay();
    }
  });

  // Initial load
  updateCartDisplay();
  setLanguage(currentLang);   // no swipe on first load
});
