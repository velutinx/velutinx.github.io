/* ==================== CONFIG ==================== */
const tierMap = { 
  1.5: { JPY: 250, CNY: 10.5, MXN: 25 }, 
  3.0: { JPY: 500, CNY: 21.0, MXN: 50 }, /* ==================== CONFIG ==================== */
const tierMap = { 
  1.5: { JPY: 250, CNY: 10.5, MXN: 25 }, 
  3.0: { JPY: 500, CNY: 21.0, MXN: 50 }, 
  10.0: { JPY: 1500, CNY: 69.0, MXN: 175 } /* ==================== CONFIG ==================== */
const tierMap = { 
  1.5: { JPY: 250, CNY: 10.5, MXN: 25 }, 
  3.0: { JPY: 500, CNY: 21.0, MXN: 50 }, 
  10.0: { JPY: 1500, CNY: 69.0, MXN: 175 } 
};
const approxRates = { JPY: 158, CNY: 6.9, MXN: 18 };

window.cart = window.cart || [];
let isDark = localStorage.getItem("darkMode") === "true";
let currentLang = localStorage.getItem("language") || "en";
let currentCurrency = currentLang === "en" ? "USD" : 
                      currentLang === "ja" ? "JPY" : 
                      currentLang === "zh" ? "CNY" : "MXN";

if (isDark) document.body.classList.add("dark");

/* ==================== LANGUAGE TRANSLATIONS ==================== */
const translations = {
  en: { 
    shopTitle: "My Store",
    filterTitle: "Filter by Category",
    catAll: "All",
    catFemale: "Female",
    catFemboy: "Femboy",
    catCollections: "Collections",
    sortTitle: "Sort by",
    sortNewest: "Newest",
    sortOldest: "Oldest",
    sortLow: "Price: Low to High",
    sortHigh: "Price: High to Low",
    productsTitle: "Products",
    searchPlaceholder: "Search",
    cartTitle: "Shopping Cart",
    totalLabel: "Total",
    snackText: "Added successfully",
    loginBtn: "Website",
    disclaimerAge: "Disclaimer: All characters depicted are portrayed as 18+. This is a fictional, consensual depiction.",
    disclaimerRefund: "Digital products are non-refundable after purchase.",
    contentsTitle: "Contents:",
    contentsDesc: "ZIP file containing {count} AI-generated illustrations",
    originalPrice: "Original Price:",
    currentPrice: "Current Price:",
    addToCart: "Add to Cart",
    removeFromCart: "Remove from Cart"
  },
  ja: { 
    shopTitle: "マイストア",
    filterTitle: "カテゴリでフィルター",
    catAll: "すべて",
    catFemale: "女性",
    catFemboy: "フェンボーイ",
    catCollections: "コレクション",
    sortTitle: "並び替え",
    sortNewest: "最新",
    sortOldest: "最古",
    sortLow: "価格: 低い → 高い",
    sortHigh: "価格: 高い → 低い",
    productsTitle: "商品",
    searchPlaceholder: "検索",
    cartTitle: "ショッピングカート",
    totalLabel: "合計",
    snackText: "カートに追加しました",
    loginBtn: "ウェブサイト",
    disclaimerAge: "免責事項：描かれているすべてのキャラクターは18歳以上として描かれています。これはフィクションであり、合意に基づく描写です。",
    disclaimerRefund: "デジタル商品は購入後の返金はできません。",
    contentsTitle: "内容：",
    contentsDesc: "{count}枚のAI生成イラストを含むZIPファイル",
    originalPrice: "元の価格：",
    currentPrice: "現在の価格：",
    addToCart: "カートに追加",
    removeFromCart: "カートから削除"
  },
  zh: { 
    shopTitle: "我的商店",
    filterTitle: "按类别筛选",
    catAll: "全部",
    catFemale: "女性",
    catFemboy: "伪娘",
    catCollections: "收藏",
    sortTitle: "排序方式",
    sortNewest: "最新",
    sortOldest: "最旧",
    sortLow: "价格: 低到高",
    sortHigh: "价格: 高到低",
    productsTitle: "商品",
    searchPlaceholder: "搜索",
    cartTitle: "购物车",
    totalLabel: "总计",
    snackText: "已成功添加到购物车",
    loginBtn: "网站",
    disclaimerAge: "免责声明：所有描绘的角色均被描绘为18岁以上。这是虚构的、双方同意的描绘。",
    disclaimerRefund: "数字产品购买后不可退款。",
    contentsTitle: "内容：",
    contentsDesc: "包含 {count} 张 AI 生成插图的 ZIP 文件",
    originalPrice: "原价：",
    currentPrice: "现价：",
    addToCart: "加入购物车",
    removeFromCart: "从购物车移除"
  },
  es: { 
    shopTitle: "Mi Tienda",
    filterTitle: "Filtrar por Categoría",
    catAll: "Todos",
    catFemale: "Femenino",
    catFemboy: "Femboy",
    catCollections: "Colecciones",
    sortTitle: "Ordenar por",
    sortNewest: "Más reciente",
    sortOldest: "Más antiguo",
    sortLow: "Precio: Bajo a Alto",
    sortHigh: "Precio: Alto a Bajo",
    productsTitle: "Productos",
    searchPlaceholder: "Buscar",
    cartTitle: "Carrito de Compras",
    totalLabel: "Total",
    snackText: "Añadido con éxito",
    loginBtn: "Sitio web",
    disclaimerAge: "Descargo de responsabilidad: Todos los personajes representados se muestran como mayores de 18 años. Esta es una representación ficticia y consensuada.",
    disclaimerRefund: "Los productos digitales no son reembolsables después de la compra.",
    contentsTitle: "Contenido:",
    contentsDesc: "Archivo ZIP que contiene {count} ilustraciones generadas por IA",
    originalPrice: "Precio original:",
    currentPrice: "Precio actual:",
    addToCart: "Añadir al carrito",
    removeFromCart: "Eliminar del carrito"
  }
};

/* ==================== HELPERS ==================== */
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

function updateAllPrices() {
  document.querySelectorAll(".price").forEach(el => {
    const base = parseFloat(el.dataset.price);
    if (!isNaN(base)) {
      el.innerHTML = formatPrice(base);
    }
  });
}

function getCart() {
  try {
    const saved = localStorage.getItem("velutinx_cart");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("velutinx_cart", JSON.stringify(cart || []));
}

function addOrToggleCart(pack) {
  let cart = getCart();
  const index = cart.findIndex(item => item.id === pack.id);
  if (index !== -1) {
    cart.splice(index, 1);
  } else {
    cart.push({
      id: pack.id,
      title: pack.title,
      image: pack.image || (pack.images && pack.images[0]) || "",
      price: getPriceForPack(pack),
      quantity: 1
    });
  }
  saveCart(cart);
  updateCartDisplay();
}

function updateCartDisplay() {
  const cart = getCart();
  const count = cart.length;
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  document.querySelectorAll("#cartCount, #floatingCartCount").forEach(el => {
    if (el) el.textContent = count;
  });

  const itemsEl = document.getElementById("cartItems");
  if (itemsEl) {
    itemsEl.innerHTML = "";
    if (count === 0) {
      itemsEl.innerHTML = "<p>Your cart is empty</p>";
    } else {
      cart.forEach((item, idx) => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
          <img src="${item.image}" alt="${item.title}">
          <div class="cart-item-info">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
          </div>
          <button class="cart-item-remove" data-idx="${idx}">×</button>
        `;
        itemsEl.appendChild(div);
      });
    }
    const totalEl = document.getElementById("cartTotal");
    if (totalEl) totalEl.textContent = formatPrice(total);
  }
}

function updateDisclaimers() {
  const t = translations[currentLang] || translations.en;
  const el = document.getElementById("disclaimer");
  if (el) {
    el.innerHTML = `
      <div style="margin-bottom: 16px;">
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <svg width="20" height="20" viewBox="0 0 512 512" style="flex-shrink: 0; margin-top: 2px;">
            <path d="M256 40 L472 440 H40 Z" fill="#FFC107" stroke="#000" stroke-width="32" stroke-linejoin="round"/>
            <rect x="236" y="180" width="40" height="160" rx="20" fill="#000"/>
            <circle cx="256" cy="380" r="24" fill="#000"/>
          </svg>
          <span style="line-height: 1.45;">${t.disclaimerAge}</span>
        </div>
      </div>
      <div>
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <svg width="20" height="20" viewBox="0 0 512 512" style="flex-shrink: 0; margin-top: 2px;">
            <path d="M256 40 L472 440 H40 Z" fill="#FFC107" stroke="#000" stroke-width="32" stroke-linejoin="round"/>
            <rect x="236" y="180" width="40" height="160" rx="20" fill="#000"/>
            <circle cx="256" cy="380" r="24" fill="#000"/>
          </svg>
          <span style="line-height: 1.45;">${t.disclaimerRefund}</span>
        </div>
      </div>
    `;
  }
}

function setLanguage(lang) {
  currentLang = lang;
  currentCurrency = lang === "en" ? "USD" : lang === "ja" ? "JPY" : lang === "zh" ? "CNY" : "MXN";
  localStorage.setItem("language", lang);

  const t = translations[lang] || translations.en;

  const ids = [
    "shopTitle", "filterTitle",
    "catAll", "catFemale", "catFemboy", "catCollections",
    "sortTitle", "sortNewest", "sortOldest", "sortLow", "sortHigh",
    "productsTitle", "cartTitle", "totalLabel", "snackText", "loginBtn"
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && t[id]) {
      el.textContent = t[id];
    }
  });

  updateCartDisplay();
  updateDisclaimers();
  updateAllPrices();
}

/* ==================== DOM READY ==================== */
document.addEventListener("DOMContentLoaded", async () => {
  await loadPrices();
  setLanguage(currentLang);

  // 1. VELUTINX logo click → redirect to store
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.style.cursor = "pointer";
    logo.addEventListener("click", () => {
      window.location.href = "https://velutinx.com/store";
    });
  }

  // 2. Website button click → redirect to main site
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = "https://velutinx.com/";
    });
  }

  // Language selector
  const langBtn = document.getElementById("langBtn");
  const popover = document.getElementById("languagePopover");
  if (langBtn && popover) {
    langBtn.addEventListener("click", e => {
      e.stopPropagation();
      popover.classList.toggle("show");
    });
  }

  document.addEventListener("click", e => {
    if (!document.getElementById("langContainer")?.contains(e.target)) {
      popover?.classList.remove("show");
    }
  });

  document.querySelectorAll(".lang-item").forEach(item => {
    item.addEventListener("click", () => {
      setLanguage(item.dataset.lang);
      popover?.classList.remove("show");
    });
  });

  // Theme toggle
  const themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      isDark = !isDark;
      document.body.classList.toggle("dark", isDark);
      localStorage.setItem("darkMode", isDark);
    });
  }

  // Cart drawer
  const cartBtn = document.getElementById("cartBtn");
  const floatCartBtn = document.getElementById("floatingCartBtn");
  const cartClose = document.getElementById("cartClose");
  const cartDrawer = document.getElementById("cartDrawer");

  const openCart = () => {
    cartDrawer?.classList.add("open");
    document.body.classList.add("drawer-open");
  };
  const closeCart = () => {
    cartDrawer?.classList.remove("open");
    document.body.classList.remove("drawer-open");
  };

  cartBtn?.addEventListener("click", openCart);
  floatCartBtn?.addEventListener("click", openCart);
  cartClose?.addEventListener("click", closeCart);

  document.addEventListener("click", e => {
    if (cartDrawer?.classList.contains("open") && 
        !cartDrawer.contains(e.target) && 
        !cartBtn?.contains(e.target) && 
        !floatCartBtn?.contains(e.target)) {
      closeCart();
    }
  });

  const cartItems = document.getElementById("cartItems");
  cartItems?.addEventListener("click", e => {
    if (e.target.classList.contains("cart-item-remove")) {
      const idx = parseInt(e.target.dataset.idx);
      window.cart.splice(idx, 1);
      updateCartDisplay();
    }
  });

  // Initial setup
  updateCartDisplay();
});
};
const approxRates = { JPY: 158, CNY: 6.9, MXN: 18 };

window.cart = window.cart || [];
let isDark = localStorage.getItem("darkMode") === "true";
let currentLang = localStorage.getItem("language") || "en";
let currentCurrency = currentLang === "en" ? "USD" : 
                      currentLang === "ja" ? "JPY" : 
                      currentLang === "zh" ? "CNY" : "MXN";

if (isDark) document.body.classList.add("dark");

/* ==================== LANGUAGE TRANSLATIONS ==================== */
const translations = {
  en: { 
    shopTitle: "My Store",
    filterTitle: "Filter by Category",
    catAll: "All",
    catFemale: "Female",
    catFemboy: "Femboy",
    catCollections: "Collections",
    sortTitle: "Sort by",
    sortNewest: "Newest",
    sortOldest: "Oldest",
    sortLow: "Price: Low to High",
    sortHigh: "Price: High to Low",
    productsTitle: "Products",
    searchPlaceholder: "Search",
    cartTitle: "Shopping Cart",
    totalLabel: "Total",
    snackText: "Added successfully",
    loginBtn: "Website",
    disclaimerAge: "Disclaimer: All characters depicted are portrayed as 18+. This is a fictional, consensual depiction.",
    disclaimerRefund: "Digital products are non-refundable after purchase.",
    contentsTitle: "Contents:",
    contentsDesc: "ZIP file containing {count} AI-generated illustrations",
    originalPrice: "Original Price:",
    currentPrice: "Current Price:",
    addToCart: "Add to Cart",
    removeFromCart: "Remove from Cart"
  },
  ja: { 
    shopTitle: "マイストア",
    filterTitle: "カテゴリでフィルター",
    catAll: "すべて",
    catFemale: "女性",
    catFemboy: "フェンボーイ",
    catCollections: "コレクション",
    sortTitle: "並び替え",
    sortNewest: "最新",
    sortOldest: "最古",
    sortLow: "価格: 低い → 高い",
    sortHigh: "価格: 高い → 低い",
    productsTitle: "商品",
    searchPlaceholder: "検索",
    cartTitle: "ショッピングカート",
    totalLabel: "合計",
    snackText: "カートに追加しました",
    loginBtn: "ウェブサイト",
    disclaimerAge: "免責事項：描かれているすべてのキャラクターは18歳以上として描かれています。これはフィクションであり、合意に基づく描写です。",
    disclaimerRefund: "デジタル商品は購入後の返金はできません。",
    contentsTitle: "内容：",
    contentsDesc: "{count}枚のAI生成イラストを含むZIPファイル",
    originalPrice: "元の価格：",
    currentPrice: "現在の価格：",
    addToCart: "カートに追加",
    removeFromCart: "カートから削除"
  },
  zh: { 
    shopTitle: "我的商店",
    filterTitle: "按类别筛选",
    catAll: "全部",
    catFemale: "女性",
    catFemboy: "伪娘",
    catCollections: "收藏",
    sortTitle: "排序方式",
    sortNewest: "最新",
    sortOldest: "最旧",
    sortLow: "价格: 低到高",
    sortHigh: "价格: 高到低",
    productsTitle: "商品",
    searchPlaceholder: "搜索",
    cartTitle: "购物车",
    totalLabel: "总计",
    snackText: "已成功添加到购物车",
    loginBtn: "网站",
    disclaimerAge: "免责声明：所有描绘的角色均被描绘为18岁以上。这是虚构的、双方同意的描绘。",
    disclaimerRefund: "数字产品购买后不可退款。",
    contentsTitle: "内容：",
    contentsDesc: "包含 {count} 张 AI 生成插图的 ZIP 文件",
    originalPrice: "原价：",
    currentPrice: "现价：",
    addToCart: "加入购物车",
    removeFromCart: "从购物车移除"
  },
  es: { 
    shopTitle: "Mi Tienda",
    filterTitle: "Filtrar por Categoría",
    catAll: "Todos",
    catFemale: "Femenino",
    catFemboy: "Femboy",
    catCollections: "Colecciones",
    sortTitle: "Ordenar por",
    sortNewest: "Más reciente",
    sortOldest: "Más antiguo",
    sortLow: "Precio: Bajo a Alto",
    sortHigh: "Precio: Alto a Bajo",
    productsTitle: "Productos",
    searchPlaceholder: "Buscar",
    cartTitle: "Carrito de Compras",
    totalLabel: "Total",
    snackText: "Añadido con éxito",
    loginBtn: "Sitio web",
    disclaimerAge: "Descargo de responsabilidad: Todos los personajes representados se muestran como mayores de 18 años. Esta es una representación ficticia y consensuada.",
    disclaimerRefund: "Los productos digitales no son reembolsables después de la compra.",
    contentsTitle: "Contenido:",
    contentsDesc: "Archivo ZIP que contiene {count} ilustraciones generadas por IA",
    originalPrice: "Precio original:",
    currentPrice: "Precio actual:",
    addToCart: "Añadir al carrito",
    removeFromCart: "Eliminar del carrito"
  }
};

/* ==================== HELPERS ==================== */
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

function updateAllPrices() {
  document.querySelectorAll(".price").forEach(el => {
    const base = parseFloat(el.dataset.price);
    if (!isNaN(base)) {
      el.innerHTML = formatPrice(base);
    }
  });
}

function getCart() {
  try {
    const saved = localStorage.getItem("velutinx_cart");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("velutinx_cart", JSON.stringify(cart || []));
}

function addOrToggleCart(pack) {
  let cart = getCart();
  const index = cart.findIndex(item => item.id === pack.id);
  if (index !== -1) {
    cart.splice(index, 1);
  } else {
    cart.push({
      id: pack.id,
      title: pack.title,
      image: pack.image || (pack.images && pack.images[0]) || "",
      price: getPriceForPack(pack),
      quantity: 1
    });
  }
  saveCart(cart);
  updateCartDisplay();
}

function updateCartDisplay() {
  const cart = getCart();
  const count = cart.length;
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  document.querySelectorAll("#cartCount, #floatingCartCount").forEach(el => {
    if (el) el.textContent = count;
  });

  const itemsEl = document.getElementById("cartItems");
  if (itemsEl) {
    itemsEl.innerHTML = "";
    if (count === 0) {
      itemsEl.innerHTML = "<p>Your cart is empty</p>";
    } else {
      cart.forEach((item, idx) => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
          <img src="${item.image}" alt="${item.title}">
          <div class="cart-item-info">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
          </div>
          <button class="cart-item-remove" data-idx="${idx}">×</button>
        `;
        itemsEl.appendChild(div);
      });
    }
    const totalEl = document.getElementById("cartTotal");
    if (totalEl) totalEl.textContent = formatPrice(total);
  }
}

function updateDisclaimers() {
  const t = translations[currentLang] || translations.en;
  const el = document.getElementById("disclaimer");
  if (el) {
    el.innerHTML = `
      <div style="margin-bottom: 16px;">
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <svg width="20" height="20" viewBox="0 0 512 512" style="flex-shrink: 0; margin-top: 2px;">
            <path d="M256 40 L472 440 H40 Z" fill="#FFC107" stroke="#000" stroke-width="32" stroke-linejoin="round"/>
            <rect x="236" y="180" width="40" height="160" rx="20" fill="#000"/>
            <circle cx="256" cy="380" r="24" fill="#000"/>
          </svg>
          <span style="line-height: 1.45;">${t.disclaimerAge}</span>
        </div>
      </div>
      <div>
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <svg width="20" height="20" viewBox="0 0 512 512" style="flex-shrink: 0; margin-top: 2px;">
            <path d="M256 40 L472 440 H40 Z" fill="#FFC107" stroke="#000" stroke-width="32" stroke-linejoin="round"/>
            <rect x="236" y="180" width="40" height="160" rx="20" fill="#000"/>
            <circle cx="256" cy="380" r="24" fill="#000"/>
          </svg>
          <span style="line-height: 1.45;">${t.disclaimerRefund}</span>
        </div>
      </div>
    `;
  }
}

function setLanguage(lang) {
  currentLang = lang;
  currentCurrency = lang === "en" ? "USD" : lang === "ja" ? "JPY" : lang === "zh" ? "CNY" : "MXN";
  localStorage.setItem("language", lang);

  const t = translations[lang] || translations.en;

  const ids = [
    "shopTitle", "filterTitle",
    "catAll", "catFemale", "catFemboy", "catCollections",
    "sortTitle", "sortNewest", "sortOldest", "sortLow", "sortHigh",
    "productsTitle", "cartTitle", "totalLabel", "snackText", "loginBtn"
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && t[id]) {
      el.textContent = t[id];
    }
  });

  updateCartDisplay();
  updateDisclaimers();
  updateAllPrices();
}

/* ==================== DOM READY ==================== */
document.addEventListener("DOMContentLoaded", async () => {
  await loadPrices();
  setLanguage(currentLang);

  // Logo click → redirect to store
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.style.cursor = "pointer";
    logo.addEventListener("click", () => {
      window.location.href = "https://velutinx.com/store";
    });
  }

  // Website button → redirect to main site
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = "https://velutinx.com/";
    });
  }

  // Language selector
  const langBtn = document.getElementById("langBtn");
  const popover = document.getElementById("languagePopover");
  if (langBtn && popover) {
    langBtn.addEventListener("click", e => {
      e.stopPropagation();
      popover.classList.toggle("show");
    });
  }

  document.addEventListener("click", e => {
    if (!document.getElementById("langContainer")?.contains(e.target)) {
      popover?.classList.remove("show");
    }
  });

  document.querySelectorAll(".lang-item").forEach(item => {
    item.addEventListener("click", () => {
      setLanguage(item.dataset.lang);
      popover?.classList.remove("show");
    });
  });

  // Theme toggle
  const themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      isDark = !isDark;
      document.body.classList.toggle("dark", isDark);
      localStorage.setItem("darkMode", isDark);
    });
  }

  // Cart drawer
  const cartBtn = document.getElementById("cartBtn");
  const floatCartBtn = document.getElementById("floatingCartBtn");
  const cartClose = document.getElementById("cartClose");
  const cartDrawer = document.getElementById("cartDrawer");

  const openCart = () => {
    cartDrawer?.classList.add("open");
    document.body.classList.add("drawer-open");
  };
  const closeCart = () => {
    cartDrawer?.classList.remove("open");
    document.body.classList.remove("drawer-open");
  };

  cartBtn?.addEventListener("click", openCart);
  floatCartBtn?.addEventListener("click", openCart);
  cartClose?.addEventListener("click", closeCart);

  document.addEventListener("click", e => {
    if (cartDrawer?.classList.contains("open") && 
        !cartDrawer.contains(e.target) && 
        !cartBtn?.contains(e.target) && 
        !floatCartBtn?.contains(e.target)) {
      closeCart();
    }
  });

  const cartItems = document.getElementById("cartItems");
  cartItems?.addEventListener("click", e => {
    if (e.target.classList.contains("cart-item-remove")) {
      const idx = parseInt(e.target.dataset.idx);
      window.cart.splice(idx, 1);
      updateCartDisplay();
    }
  });

  // Initial setup
  updateCartDisplay();
});
  10.0: { JPY: 1500, CNY: 69.0, MXN: 175 } 
};
const approxRates = { JPY: 158, CNY: 6.9, MXN: 18 };

window.cart = window.cart || [];
let isDark = localStorage.getItem("darkMode") === "true";
let currentLang = localStorage.getItem("language") || "en";
let currentCurrency = currentLang === "en" ? "USD" : 
                      currentLang === "ja" ? "JPY" : 
                      currentLang === "zh" ? "CNY" : "MXN";

if (isDark) document.body.classList.add("dark");

/* ==================== LANGUAGE TRANSLATIONS ==================== */
const translations = {
  en: { 
    shopTitle: "My Store", filterTitle: "Filter by Category", catAll: "All", catNot: "Not On Booth", catFrom: "From Booth", catSisters: "The Sisters Corner", 
    sortTitle: "Sort by", sortDefault: "Default", sortNewest: "Newest", sortLow: "Price: Low to High", sortHigh: "Price: High to Low", resetBtn: "Reset", 
    productsTitle: "Products", cartTitle: "Shopping Cart", totalLabel: "Total", snackText: "Added successfully", loginBtn: "Website", searchPlaceholder: "Search..."
  },
  ja: { 
    shopTitle: "マイストア", filterTitle: "カテゴリでフィルター", catAll: "すべて", catNot: "ブースにない", catFrom: "ブースから", catSisters: "シスターズコーナー", 
    sortTitle: "並び替え", sortDefault: "デフォルト", sortNewest: "最新", sortLow: "価格: 低い → 高い", sortHigh: "価格: 高い → 低い", resetBtn: "リセット", 
    productsTitle: "商品", cartTitle: "ショッピングカート", totalLabel: "合計", snackText: "カートに追加しました", loginBtn: "ウェブサイト", searchPlaceholder: "検索..."
  },
  zh: { 
    shopTitle: "我的商店", filterTitle: "按类别筛选", catAll: "全部", catNot: "不在展位上", catFrom: "来自展位", catSisters: "姐妹角落", 
    sortTitle: "排序方式", sortDefault: "默认", sortNewest: "最新", sortLow: "价格: 低到高", sortHigh: "价格: 高到低", resetBtn: "重置", 
    productsTitle: "商品", cartTitle: "购物车", totalLabel: "总计", snackText: "已成功添加到购物车", loginBtn: "网站", searchPlaceholder: "搜索..."
  },
  es: { 
    shopTitle: "Mi Tienda", filterTitle: "Filtrar por Categoría", catAll: "Todos", catNot: "No en Booth", catFrom: "Desde Booth", catSisters: "El Rincón de las Hermanas", 
    sortTitle: "Ordenar por", sortDefault: "Predeterminado", sortNewest: "Más reciente", sortLow: "Precio: Bajo a Alto", sortHigh: "Precio: Alto a Bajo", resetBtn: "Reiniciar", 
    productsTitle: "Productos", cartTitle: "Carrito de Compras", totalLabel: "Total", snackText: "Añadido con éxito", loginBtn: "Sitio web", searchPlaceholder: "Buscar..."
  }
};

/* ==================== HELPERS ==================== */
function formatPrice(value, currency) {
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

function updateAllPrices() {
  document.querySelectorAll(".price").forEach(el => {
    const base = parseFloat(el.dataset.price);
    const orig = parseFloat(el.dataset.original);
    if (isNaN(base)) return;
    let html = formatPrice(base, currentCurrency);
    if (orig && orig > base) html += ` <del>${formatPrice(orig, currentCurrency)}</del>`;
    el.innerHTML = html;
  });
}

function setLanguage(lang) {
  if (!translations[lang]) lang = "en";
  currentLang = lang;
  currentCurrency = lang === "en" ? "USD" : lang === "ja" ? "JPY" : lang === "zh" ? "CNY" : "MXN";
  localStorage.setItem("language", lang);

  const t = translations[lang];

  // Update static texts
  const ids = ["shopTitle","filterTitle","catAll","catNot","catFrom","catSisters","sortTitle","sortDefault","sortNewest","sortLow","sortHigh","resetBtn","productsTitle","cartTitle","totalLabel","snackText","loginBtn"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && t[id]) el.textContent = t[id];
  });

  const searchInput = document.getElementById("searchInput");
  if (searchInput && t.searchPlaceholder) searchInput.placeholder = t.searchPlaceholder;

  updateAllPrices();
  updateCartDisplay();

  // Optional: visual feedback
  document.body.classList.add("lang-changed");
  setTimeout(() => document.body.classList.remove("lang-changed"), 500);
}

function updateCartDisplay() {
  const count = window.cart.length;
  ["cartCount", "floatingCartCount"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = count;
  });

  const cartItemsEl = document.getElementById("cartItems");
  if (!cartItemsEl) return;

  cartItemsEl.innerHTML = "";
  let realTotalUSD = 0;

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

  const totalEl = document.getElementById("cartTotal");
  if (totalEl) totalEl.textContent = formatPrice(realTotalUSD, currentCurrency);

  const active = count > 0;
  ["cartBtn", "floatingCartBtn"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.toggle("active", active);
  });
}

/* ==================== INIT ==================== */
document.addEventListener("DOMContentLoaded", () => {
  const langBtn = document.getElementById("langBtn");
  const popover = document.getElementById("languagePopover");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartClose = document.getElementById("cartClose");
  const themeBtn = document.getElementById("themeBtn");
  const cartBtn = document.getElementById("cartBtn");
  const floatCartBtn = document.getElementById("floatingCartBtn");
  const cartItems = document.getElementById("cartItems");

  // Language selector
  if (langBtn && popover) {
    langBtn.addEventListener("click", e => {
      e.stopPropagation();
      popover.classList.toggle("show");
    });
  }

  document.addEventListener("click", e => {
    if (!document.getElementById("langContainer")?.contains(e.target)) {
      popover?.classList.remove("show");
    }
  });

  document.querySelectorAll(".lang-item").forEach(item => {
    item.addEventListener("click", () => {
      setLanguage(item.dataset.lang);
      popover?.classList.remove("show");
    });
  });

  // Theme toggle
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      isDark = !isDark;
      document.body.classList.toggle("dark", isDark);
      localStorage.setItem("darkMode", isDark);
    });
  }

  // Cart drawer
  const openCart = () => {
    cartDrawer?.classList.add("open");
    document.body.classList.add("drawer-open");
  };
  const closeCart = () => {
    cartDrawer?.classList.remove("open");
    document.body.classList.remove("drawer-open");
  };

  cartBtn?.addEventListener("click", openCart);
  floatCartBtn?.addEventListener("click", openCart);
  cartClose?.addEventListener("click", closeCart);

  document.addEventListener("click", e => {
    if (cartDrawer?.classList.contains("open") && 
        !cartDrawer.contains(e.target) && 
        !cartBtn?.contains(e.target) && 
        !floatCartBtn?.contains(e.target)) {
      closeCart();
    }
  });

  cartItems?.addEventListener("click", e => {
    if (e.target.classList.contains("cart-item-remove")) {
      const idx = parseInt(e.target.dataset.idx);
      window.cart.splice(idx, 1);
      updateCartDisplay();
    }
  });

  // Initial setup
  updateCartDisplay();
  setLanguage(currentLang);
});

/* ==================== PAYPAL SDK ==================== */
(function loadPayPalSDK() {
  const loader = document.createElement('script');
  loader.src = "/paypal-sdk";
  loader.async = true;
  loader.onload = () => {
    console.log("PayPal proxy loader executed");
    waitForPayPalSDK();
  };
  document.head.appendChild(loader);
})();

function waitForPayPalSDK() {
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if (typeof paypal !== 'undefined') {
      clearInterval(interval);
      initPayPalButtons();
    } else if (attempts >= 50) {
      clearInterval(interval);
      console.error("PayPal SDK Timeout");
    }
  }, 300);
}

function initPayPalButtons() {
  const container = document.getElementById("paypal-button-container");
  if (!container || typeof paypal === 'undefined') return;

  paypal.Buttons({
    createOrder: (data, actions) => {
      let currentCart = [];
      try {
        const saved = localStorage.getItem("velutinx_cart");
        currentCart = saved ? JSON.parse(saved) : [];
      } catch (e) {
        currentCart = [];
      }

      if (!currentCart || currentCart.length === 0) {
        alert("Your cart is empty!");
        return;
      }

      const total = currentCart.reduce((sum, item) => sum + item.price, 0);

      return actions.order.create({
        purchase_units: [{
          description: "Velutinx Digital Content",
          amount: {
            currency_code: "USD",
            value: total.toFixed(2)
          }
        }]
      });
    },

    onApprove: (data, actions) => {
      return actions.order.capture().then(async (details) => {
        const cart = JSON.parse(localStorage.getItem("velutinx_cart") || "[]");
        const itemNames = cart.map(item => item.id.replace('item-', 'PACK').toUpperCase()).join(',');

        const orderData = {
          paypal_token: details.id,
          paypal_email: details.payer.email_address,
          amount: details.purchase_units[0].amount.value,
          currency: "USD",
          cart: itemNames,
          status: 'COMPLETED'
        };

        try {
          await fetch('/save-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
          });
        } catch (err) {
          console.error("Save order error:", err);
        }

        window.location.href = `/success.html?token=${details.id}`;
      });
    },

    onError: (err) => {
      console.error("PayPal Error:", err);
    }
  }).render("#paypal-button-container");
}
