// ================================================
// Shared shop logic: cart, currency, translations
// Wrapped in IIFE to eliminate all global redeclaration risks
// ================================================

(function () {
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

  const tierMap = {
    1.5: { JPY: 250, CNY: 10.5, MXN: 25 },
    3.0: { JPY: 500, CNY: 21.0, MXN: 50 },
    10.0: { JPY: 1500, CNY: 69.0, MXN: 175 }
  };

  const approxRates = { JPY: 158, CNY: 6.9, MXN: 18 };

  // Local variables - no global conflict
  let currentLang = localStorage.getItem("language") || "en";
  let currentCurrency = currentLang === "en" ? "USD" :
                        currentLang === "ja" ? "JPY" :
                        currentLang === "zh" ? "CNY" : "MXN";

  window.cart = window.cart || [];

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

  function updateAllPrices() {
    document.querySelectorAll(".price").forEach(el => {
      const base = parseFloat(el.dataset.price);
      if (!isNaN(base)) {
        el.innerHTML = formatPrice(base);
      }
    });
  }

  function updateCartDisplay() {
    const countEls = [document.getElementById("cartCount"), document.getElementById("floatingCartCount")];
    const count = window.cart.length;
    countEls.forEach(el => { if (el) el.textContent = count; });

    const itemsEl = document.getElementById("cartItems");
    if (!itemsEl) return;

    itemsEl.innerHTML = "";
    let total = 0;

    window.cart.forEach((item, idx) => {
      total += item.price;
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

    const totalEl = document.getElementById("cartTotal");
    if (totalEl) totalEl.textContent = formatPrice(total);

    const active = count > 0;
    [document.getElementById("cartBtn"), document.getElementById("floatingCartBtn")].forEach(btn => {
      if (btn) btn.classList.toggle("active", active);
    });
  }

  function setLanguage(lang) {
    if (currentLang === lang) return;
    currentLang = lang;
    currentCurrency = lang === "en" ? "USD" : lang === "ja" ? "JPY" : lang === "zh" ? "CNY" : "MXN";
    localStorage.setItem("language", lang);

    const swipe = document.getElementById("langSwipe");
    if (swipe) {
      swipe.classList.remove("active");
      void swipe.offsetHeight;
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

  // Initial setup
  document.addEventListener("DOMContentLoaded", () => {
    updateCartDisplay();
    updateAllPrices();
    setLanguage(currentLang);

    const itemsEl = document.getElementById("cartItems");
    if (itemsEl) {
      itemsEl.addEventListener("click", e => {
        if (e.target.classList.contains("cart-item-remove")) {
          const idx = parseInt(e.target.dataset.idx);
          if (!isNaN(idx) && idx >= 0 && idx < window.cart.length) {
            window.cart.splice(idx, 1);
            updateCartDisplay();
          }
        }
      });
    }
  });
})();
