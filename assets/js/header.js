/* ==================== CONFIG ==================== */
const tierMap = { 
  1.5: { JPY: 250,   CNY: 10.5, MXN: 25   },
  3.0: { JPY: 500,   CNY: 21.0, MXN: 50   },
  10.0: { JPY: 1500, CNY: 69.0, MXN: 175  }
};

const approxRates = { JPY: 158, CNY: 6.9, MXN: 18 };

window.cart = window.cart || [];
let isDark = localStorage.getItem("darkMode") === "true";
let currentLang = localStorage.getItem("language") || "en";
let currentCurrency = currentLang === "en" ? "USD" : 
                      currentLang === "ja" ? "JPY" : 
                      currentLang === "zh" ? "CNY" : "MXN";

if (isDark) document.body.classList.add("dark");

// Real base prices in USD (used for secure validation & fallback)
const prices = {
  low:  1.50,   // category 1
  mid:  3.00,   // category 2 (most of your current packs)
  high: 10.00   // future / collections (not used yet)
};

/* ==================== STORE TRANSLATIONS (only used if store elements exist) ==================== */
const storeTranslations = {
  en: { 
    shopTitle: "My Store",
    filterTitle: "Filter by Category",
    catAll: "All Products",
    catFemale: "Female Models",
    catFemboy: "Femboy Models",
    catCollections: "Full Collections",
    sortTitle: "Sort by",
    sortNewest: "Newest",
    sortOldest: "Oldest",
    sortLow: "Price: Low to High",
    sortHigh: "Price: High to Low",
    productsTitle: "Latest Content",
    searchPlaceholder: "Search products...",
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
    catAll: "すべての商品",
    catFemale: "女性モデル",
    catFemboy: "男の娘モデル",
    catCollections: "フルコレクション",
    sortTitle: "並び替え",
    sortNewest: "最新",
    sortOldest: "最古",
    sortLow: "価格：安い順",
    sortHigh: "価格：高い順",
    productsTitle: "最新コンテンツ",
    searchPlaceholder: "商品を検索...",
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
    filterTitle: "按分类筛选",
    catAll: "全部商品",
    catFemale: "女性模型",
    catFemboy: "伪娘模型",
    catCollections: "完整合集",
    sortTitle: "排序方式",
    sortNewest: "最新上架",
    sortOldest: "最早上架",
    sortLow: "价格：低到高",
    sortHigh: "价格：高到低",
    productsTitle: "最新内容",
    searchPlaceholder: "搜索商品…",
    cartTitle: "购物车",
    totalLabel: "总计",
    snackText: "已成功加入购物车",
    loginBtn: "网站",
    disclaimerAge: "免责声明：所有描绘角色均设定为18岁以上。此为虚构且双方同意的创作内容。",
    disclaimerRefund: "数字产品一经购买概不退款。",
    contentsTitle: "内容包含：",
    contentsDesc: "包含 {count} 张AI生成插画的ZIP文件",
    originalPrice: "原价：",
    currentPrice: "现价：",
    addToCart: "加入购物车",
    removeFromCart: "移出购物车"
  },
  es: {
    shopTitle: "Mi Tienda",
    filterTitle: "Filtrar por categoría",
    catAll: "Todos los productos",
    catFemale: "Modelos femeninas",
    catFemboy: "Modelos femboy",
    catCollections: "Colecciones completas",
    sortTitle: "Ordenar por",
    sortNewest: "Más recientes",
    sortOldest: "Más antiguos",
    sortLow: "Precio: de menor a mayor",
    sortHigh: "Precio: de mayor a menor",
    productsTitle: "Contenido más reciente",
    searchPlaceholder: "Buscar productos...",
    cartTitle: "Carrito de compras",
    totalLabel: "Total",
    snackText: "Añadido correctamente",
    loginBtn: "Sitio web",
    disclaimerAge: "Descargo de responsabilidad: Todos los personajes representados tienen 18 años o más. Se trata de una representación ficticia y consensuada.",
    disclaimerRefund: "Los productos digitales no son reembolsables una vez comprados.",
    contentsTitle: "Contenido:",
    contentsDesc: "Archivo ZIP con {count} ilustraciones generadas por IA",
    originalPrice: "Precio original:",
    currentPrice: "Precio actual:",
    addToCart: "Añadir al carrito",
    removeFromCart: "Eliminar del carrito"
  }
};

/* ==================== PRICE & FORMAT HELPERS ==================== */
function getPriceForPack(pack) {
  if (typeof pack.price === 'number') return pack.price;
  const code = String(pack.price || "").toUpperCase().trim();
  if (code === "PRICE_LOW" || code === "LOW") return prices.low;
  if (code === "PRICE_MID" || code === "PRICE_MED" || code === "MID" || code === "MED") return prices.mid;
  if (code === "PRICE_HIGH" || code === "HIGH") return prices.high;
  if (pack.category === 1) return prices.low;
  if (pack.category === 2) return prices.mid;
  return prices.mid;
}

function formatPrice(value, currency = currentCurrency) {
  const num = Number(value);
  if (isNaN(num) || num <= 0) return currency === "USD" ? "US$0.00" : "—";
  if (currency === "USD") return `US$${num.toFixed(2)}`;
  const rounded = Math.round(num * 100) / 100;
  if (tierMap[rounded] && tierMap[rounded][currency] !== undefined) {
    const converted = tierMap[rounded][currency];
    const symbol = currency === "JPY" ? "円" : currency === "CNY" ? "元" : "MXN$";
    return `${symbol}${converted}`;
  }
  let converted = num * (approxRates[currency] || 1);
  converted = (currency === "JPY" || currency === "MXN") ? Math.ceil(converted) : Math.ceil(converted * 10) / 10;
  const symbol = currency === "JPY" ? "円" : currency === "CNY" ? "元" : "MXN$";
  return `${symbol}${converted}`;
}

function updateAllPrices() {
  document.querySelectorAll(".price[data-price]").forEach(el => {
    const base = parseFloat(el.dataset.price);
    if (!isNaN(base)) {
      el.textContent = formatPrice(base);
    } else {
      el.textContent = currentCurrency === "USD" ? "US$?.??" : "—";
    }
  });

  const totalEl = document.getElementById("cartTotal");
  if (totalEl) {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);
    totalEl.textContent = formatPrice(total);
  }
}

function getCart() {
  try {
    const saved = localStorage.getItem("velutinx_cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("velutinx_cart", JSON.stringify(cart || []));
}

function addOrToggleCart(pack) {
  let cart = getCart();
  const index = cart.findIndex(item => item.id === pack.id);
  const isAdding = index === -1;

  const card = document.querySelector(`.product-card[data-id="${pack.id}"]`);
  const btn = card?.querySelector(".cart-btn");

  let imageUrl = pack.image || `https://www.velutinx.com/i/pack${String(pack.id).padStart(3, '0')}-1.jpg`;

  if (isAdding) {
    cart.push({
      id: pack.id,
      title: pack.title,
      image: imageUrl,
      price: getPriceForPack(pack),
      quantity: 1
    });
    btn?.classList.add("added");
    showSnackbar("Added to cart", false);
  } else {
    cart.splice(index, 1);
    btn?.classList.remove("added");
    showSnackbar("Removed from cart", true);
  }

  saveCart(cart);
  updateCartDisplay();
  updateAllPrices();
}

function updateCartDisplay() {
  const cart = getCart();
  const count = cart.length;
  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  document.querySelectorAll("#cartCount, #floatingCartCount").forEach(el => {
    if (el) el.textContent = count;
  });

  const itemsEl = document.getElementById("cartItems");
  if (itemsEl) {
    itemsEl.innerHTML = count === 0 
      ? "<p style='text-align:center; color:var(--gray); padding:2rem 0;'>Your cart is empty</p>" 
      : "";

    cart.forEach((item, idx) => {
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/85?text=?'">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
        </div>
        <button class="cart-item-remove" data-idx="${idx}">×</button>
      `;
      itemsEl.appendChild(div);
    });

    const totalEl = document.getElementById("cartTotal");
    if (totalEl) totalEl.textContent = formatPrice(total);
  }
}

function showSnackbar(msg, isRemove = false) {
  const sb = document.getElementById("snackbar");
  const text = document.getElementById("snackText");
  const icon = sb?.querySelector("svg");
  if (!sb || !text || !icon) return;

  sb.style.background = isRemove ? "#ef4444" : "var(--success)";
  sb.style.color = "white";

  icon.innerHTML = isRemove
    ? `<path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="M20 6L9 17l-5-5"></path>`;

  text.textContent = msg;
  sb.classList.add("show");
  setTimeout(() => sb.classList.remove("show"), 2800);
}

/* ==================== LANGUAGE ==================== */
function setLanguage(lang) {
  currentLang = lang;
  currentCurrency = lang === "en" ? "USD" : lang === "ja" ? "JPY" : lang === "zh" ? "CNY" : "MXN";
  localStorage.setItem("language", lang);

  // Update store UI only if store elements exist
  const t = storeTranslations[lang] || storeTranslations.en;
  const elements = {
    shopTitle: t.shopTitle,
    filterTitle: t.filterTitle,
    catAll: t.catAll,
    catFemale: t.catFemale,
    catFemboy: t.catFemboy,
    catCollections: t.catCollections,
    sortTitle: t.sortTitle,
    sortNewest: t.sortNewest,
    sortOldest: t.sortOldest,
    sortLow: t.sortLow,
    sortHigh: t.sortHigh,
    productsTitle: t.productsTitle,
    cartTitle: t.cartTitle,
    totalLabel: t.totalLabel,
    snackText: t.snackText,
    loginBtn: t.loginBtn,
  };

  Object.entries(elements).forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) {
      if (id === "searchInput") el.placeholder = text;
      else el.textContent = text;
    }
  });

  // Update search input placeholder separately if it exists
  const searchInput = document.getElementById("searchInput");
  if (searchInput && t.searchPlaceholder) {
    searchInput.placeholder = t.searchPlaceholder;
  }

  const shopTitleEl = document.getElementById("shopTitle");
  if (shopTitleEl) shopTitleEl.classList.add("loaded");

  // Update cart and prices only if cart elements exist
  if (document.getElementById("cartCount")) {
    updateCartDisplay();
    updateAllPrices();
  }
}

/* ==================== DOM READY ==================== */
document.addEventListener("DOMContentLoaded", () => {
  setLanguage(currentLang);

  // Website button
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", e => {
      e.preventDefault();
      window.location.href = "https://velutinx.com/";
    });
  }

  // Language popover
  const langBtn = document.getElementById("langBtn");
  const popover = document.getElementById("languagePopover");
  if (langBtn && popover) {
    langBtn.addEventListener("click", e => {
      e.stopPropagation();
      popover.classList.toggle("show");
    });

    document.addEventListener("click", e => {
      if (!document.getElementById("langContainer")?.contains(e.target)) {
        popover.classList.remove("show");
      }
    });
  }

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

  // Cart drawer (only if cart elements exist)
  const cartBtn = document.getElementById("cartBtn");
  const floatCartBtn = document.getElementById("floatingCartBtn");
  const cartClose = document.getElementById("cartClose");
  const cartDrawer = document.getElementById("cartDrawer");

  if (cartBtn && floatCartBtn && cartClose && cartDrawer) {
    const openCart = () => { cartDrawer.classList.add("open"); document.body.classList.add("drawer-open"); };
    const closeCart = () => { cartDrawer.classList.remove("open"); document.body.classList.remove("drawer-open"); };

    cartBtn.addEventListener("click", openCart);
    floatCartBtn.addEventListener("click", openCart);
    cartClose.addEventListener("click", closeCart);

    document.addEventListener("click", e => {
      if (cartDrawer.classList.contains("open") &&
          !cartDrawer.contains(e.target) &&
          !cartBtn.contains(e.target) &&
          !floatCartBtn.contains(e.target)) {
        closeCart();
      }
    });

    // Remove item from cart
    const cartItems = document.getElementById("cartItems");
    if (cartItems) {
      cartItems.addEventListener("click", e => {
        if (e.target.classList.contains("cart-item-remove")) {
          e.stopPropagation();
          e.preventDefault();
          const idx = parseInt(e.target.dataset.idx);
          if (!isNaN(idx) && idx >= 0 && idx < window.cart.length) {
            window.cart.splice(idx, 1);
            saveCart(window.cart);
            updateCartDisplay();
            updateAllPrices();
          }
        }
      });
    }
  }

  // Sidebar toggle
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const menuToggle = document.getElementById('menuToggle');
  const sidebarMenuToggle = document.getElementById('sidebarMenuToggle');

  if (menuToggle && sidebar && sidebarOverlay && sidebarMenuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    sidebarMenuToggle.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });

    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Initial cart & price update if cart exists
  if (document.getElementById("cartCount")) {
    updateCartDisplay();
    updateAllPrices();
  }
});

// Expose globals
window.getPriceForPack   = getPriceForPack;
window.addOrToggleCart   = addOrToggleCart;
window.updateCartDisplay = updateCartDisplay;
window.updateAllPrices   = updateAllPrices;
window.formatPrice       = formatPrice;
window.getCart           = getCart;
window.saveCart          = saveCart;
