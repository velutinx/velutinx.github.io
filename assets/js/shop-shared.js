// assets/js/shop-shared.js
// ================================================
// Shared shop logic: cart (persistent), currency, translations, prices
// ================================================
(function () {
  "use strict";

  // ───────────────────────────────────────────────
  // Translations
  // ───────────────────────────────────────────────
  const translations = {
    en: {
      shopTitle: "My Store",
      filterTitle: "Filter by Category",
      catAll: "All",
      catNot: "Not On Booth",
      catFrom: "From Booth",
      catSisters: "The Sisters Corner",
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
      loginBtn: "Website"
    },
    ja: {
      shopTitle: "マイストア",
      filterTitle: "カテゴリでフィルター",
      catAll: "すべて",
      catNot: "ブースにない",
      catFrom: "ブースから",
      catSisters: "シスターズコーナー",
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
      loginBtn: "ウェブサイト"
    },
    zh: {
      shopTitle: "我的商店",
      filterTitle: "按类别筛选",
      catAll: "全部",
      catNot: "不在展位上",
      catFrom: "来自展位",
      catSisters: "姐妹角落",
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
      loginBtn: "网站"
    },
    es: {
      shopTitle: "Mi Tienda",
      filterTitle: "Filtrar por Categoría",
      catAll: "Todos",
      catNot: "No en Booth",
      catFrom: "Desde Booth",
      catSisters: "El Rincón de las Hermanas",
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
      loginBtn: "Sitio web"
    }
  };

  // ───────────────────────────────────────────────
  // Price conversion helpers
  // ───────────────────────────────────────────────
  const tierMap = {
    1.5: { JPY: 250, CNY: 10.5, MXN: 25 },
    3.0: { JPY: 500, CNY: 21.0, MXN: 50 },
    10.0: { JPY: 1500, CNY: 69.0, MXN: 175 }
  };
  const approxRates = { JPY: 158, CNY: 6.9, MXN: 18 };

  let currentLang = localStorage.getItem("language") || "en";
  let currentCurrency = currentLang === "en" ? "USD" :
                        currentLang === "ja" ? "JPY" :
                        currentLang === "zh" ? "CNY" : "MXN";

  // Price tiers (will be overwritten if /prices endpoint works)
  let prices = { low: 1.5, med: 3.0, high: 10.0 };

  async function loadPrices() {
    try {
      const res = await fetch("/prices");
      if (!res.ok) throw new Error("Prices fetch failed");
      const data = await res.json();
      prices.low = data.low || 1.5;
      prices.med = data.med || 3.0;
      prices.high = data.high || 10.0;
      console.log("Prices loaded:", prices);
    } catch (err) {
      console.warn("Could not load prices — using defaults", err);
    }
  }

  function getPriceForPack(pack) {
    switch (pack.price) {
      case "PRICE_LOW":  return prices.low;
      case "PRICE_MED":  return prices.med;
      case "PRICE_HIGH": return prices.high;
      default:           return prices.med;
    }
  }

  function formatPrice(value, currency = currentCurrency) {
    if (currency === "USD") return `US$${value.toFixed(2)}`;
    const rounded = Math.round(value * 100) / 100;
    if (tierMap[rounded] && tierMap[rounded][currency] !== undefined) {
      const converted = tierMap[rounded][currency];
      const symbol = currency === "JPY" ? "円" : currency === "CNY" ? "元" : "MXN$";
      return `${symbol}${converted}`;
    }
    let converted = value * approxRates[currency];
    if (currency === "JPY" || currency === "MXN") converted = Math.ceil(converted);
    else converted = Math.ceil(converted * 10) / 10;
    const symbol = currency === "JPY" ? "円" : currency === "CNY" ? "元" : "MXN$";
    return `${symbol}${converted}`;
  }

  // ───────────────────────────────────────────────
  // Persistent Cart (localStorage)
  // ───────────────────────────────────────────────
  function getCart() {
    try {
      const saved = localStorage.getItem("velutinx_cart");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Cart parse error → returning empty", e);
      return [];
    }
  }

  function saveCart(cartArray) {
    localStorage.setItem("velutinx_cart", JSON.stringify(cartArray));
  }

  function addOrToggleCart(pack) {
    let cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === pack.id);

    if (existingIndex !== -1) {
      // Toggle → remove if already present
      cart.splice(existingIndex, 1);
    } else {
      // Add
      cart.push({
        id: pack.id,
        title: pack.title,
        image: pack.image || pack.images?.[0] || "",
        price: getPriceForPack(pack),
        quantity: 1
      });
    }

    saveCart(cart);
    updateCartDisplay();
    return cart;
  }

  function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    updateCartDisplay();
    return cart;
  }

  function getCartItemCount() {
    return getCart().reduce((sum, item) => sum + (item.quantity || 1), 0);
  }

  function getCartTotal() {
    return getCart().reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  }

  // ───────────────────────────────────────────────
  // UI updates
  // ───────────────────────────────────────────────
  function updateAllPrices() {
    document.querySelectorAll(".price").forEach(el => {
      const base = parseFloat(el.dataset.price);
      if (!isNaN(base)) {
        el.innerHTML = formatPrice(base);
      }
    });
  }

  function updateCartDisplay() {
    const count = getCartItemCount();
    const total = getCartTotal();

    // Badges
    [document.getElementById("cartCount"), document.getElementById("floatingCartCount")]
      .forEach(el => { if (el) el.textContent = count; });

    const itemsEl = document.getElementById("cartItems");
    if (!itemsEl) return;

    itemsEl.innerHTML = "";
    if (count === 0) {
      itemsEl.innerHTML = "<p style='text-align:center; padding:2rem;'>Your cart is empty</p>";
    } else {
      getCart().forEach(item => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
          <img src="${item.image}" alt="${item.title}" style="width:48px;height:64px;object-fit:cover;border-radius:4px;">
          <div class="cart-item-info">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
          </div>
          <button class="cart-item-remove" data-id="${item.id}">×</button>
        `;
        itemsEl.appendChild(div);
      });
    }

    const totalEl = document.getElementById("cartTotal");
    if (totalEl) totalEl.textContent = formatPrice(total);

    const active = count > 0;
    [document.getElementById("cartBtn"), document.getElementById("floatingCartBtn")]
      .forEach(btn => { if (btn) btn.classList.toggle("active", active); });
  }

  // ───────────────────────────────────────────────
  // Language switch
  // ───────────────────────────────────────────────
  function setLanguage(lang) {
    if (currentLang === lang) return;
    currentLang = lang;
    currentCurrency = lang === "en" ? "USD" : lang === "ja" ? "JPY" : lang === "zh" ? "CNY" : "MXN";
    localStorage.setItem("language", lang);

    const swipe = document.getElementById("langSwipe");
    if (swipe) {
      swipe.classList.remove("active");
      void swipe.offsetHeight; // force reflow
      swipe.classList.add("active");
    }

    const t = translations[lang] || translations.en;
    const texts = {
      shopTitle: t.shopTitle,
      filterTitle: t.filterTitle,
      catAll: t.catAll,
      catNot: t.catNot,
      catFrom: t.catFrom,
      catSisters: t.catSisters,
      sortTitle: t.sortTitle,
      sortNewest: t.sortNewest,
      sortOldest: t.sortOldest,
      sortLow: t.sortLow,
      sortHigh: t.sortHigh,
      productsTitle: t.productsTitle,
      cartTitle: t.cartTitle,
      totalLabel: t.totalLabel,
      snackText: t.snackText,
      loginBtn: t.loginBtn
    };

    Object.entries(texts).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });

    const search = document.getElementById("searchInput");
    if (search) search.placeholder = t.searchPlaceholder;

    updateAllPrices();
    updateCartDisplay();
  }

  // ───────────────────────────────────────────────
  // Event listeners & init
  // ───────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", async () => {
    await loadPrices();
    updateCartDisplay();
    updateAllPrices();
    setLanguage(currentLang);

    const itemsEl = document.getElementById("cartItems");
    if (itemsEl) {
      itemsEl.addEventListener("click", e => {
        if (e.target.classList.contains("cart-item-remove")) {
          const id = e.target.dataset.id;
          if (id) {
            removeFromCart(id);
          }
        }
      });
    }
  });

  // ───────────────────────────────────────────────
  // Expose to window
  // ───────────────────────────────────────────────
  window.formatPrice      = formatPrice;
  window.getPriceForPack  = getPriceForPack;
  window.updateAllPrices  = updateAllPrices;
  window.updateCartDisplay = updateCartDisplay;
  window.setLanguage      = setLanguage;
  window.addOrToggleCart  = addOrToggleCart;
  window.removeFromCart   = removeFromCart;

})();
