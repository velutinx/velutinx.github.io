(function () {
  "use strict";

  /* ==================== TRANSLATIONS ==================== */
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

/* ==================== PRICE & CURRENCY ==================== */
  const tierMap = { 1.5: { JPY: 250, CNY: 10.5, MXN: 25 }, 3.0: { JPY: 500, CNY: 21.0, MXN: 50 }, 10.0: { JPY: 1500, CNY: 69.0, MXN: 175 } };
  const approxRates = { JPY: 158, CNY: 6.9, MXN: 18 };

  let currentLang = localStorage.getItem("language") || "en";
  let currentCurrency = currentLang === "en" ? "USD" : currentLang === "ja" ? "JPY" : currentLang === "zh" ? "CNY" : "MXN";

  function getPriceForPack(pack) {
    const prices = { low: 1.5, med: 3.0, high: 10.0 };
    if (pack.price === "PRICE_LOW") return prices.low;
    if (pack.price === "PRICE_HIGH") return prices.high;
    return prices.med;
  }

  function formatPrice(value, currency = currentCurrency) {
    if (currency === "USD") return `US$${value.toFixed(2)}`;
    const rounded = Math.round(value * 100) / 100;
    const symbol = currency === "JPY" ? "円" : currency === "CNY" ? "元" : "MXN$";
    if (tierMap[rounded] && tierMap[rounded][currency] !== undefined) return `${symbol}${tierMap[rounded][currency]}`;
    let converted = value * (approxRates[currency] || 1);
    converted = (currency === "JPY" || currency === "MXN") ? Math.ceil(converted) : Math.ceil(converted * 10) / 10;
    return `${symbol}${converted}`;
  }

  /* ==================== CART MANAGEMENT ==================== */
  function getCart() { try { return JSON.parse(localStorage.getItem("velutinx_cart")) || []; } catch (e) { return []; } }
  function saveCart(cart) { localStorage.setItem("velutinx_cart", JSON.stringify(cart || [])); }

  function addOrToggleCart(pack) {
    let cart = getCart();
    const index = cart.findIndex(item => item.id === pack.id);
    if (index !== -1) {
      cart.splice(index, 1);
      showSnackbar("Removed from cart", false);
    } else {
      cart.push({ id: pack.id, title: pack.title, image: pack.images[0], price: getPriceForPack(pack), quantity: 1 });
      showSnackbar(translations[currentLang].snackText, true);
    }
    saveCart(cart);
    updateCartDisplay();
  }

  function updateCartDisplay() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.querySelectorAll("#cartCount, #floatingCartCount").forEach(el => el.textContent = cart.length);
    
    const itemsEl = document.getElementById("cartItems");
    if (itemsEl) {
      itemsEl.innerHTML = cart.length ? cart.map((item, idx) => `
        <div class="cart-item">
          <img src="${item.image}">
          <div class="cart-item-info">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
          </div>
          <button class="cart-item-remove" onclick="window.removeItem(${idx})">×</button>
        </div>`).join('') : "<p>Your cart is empty</p>";
    }
    const totalEl = document.getElementById("cartTotal");
    if (totalEl) totalEl.textContent = formatPrice(total);
    
    // Refresh PayPal if buttons already exist
    if (window.paypal && cart.length > 0) initPayPalButtons();
    else if (cart.length === 0 && document.getElementById("paypal-button-container")) {
        document.getElementById("paypal-button-container").innerHTML = '';
    }
  }

  function showSnackbar(msg, isSuccess) {
    const snackbar = document.getElementById("snackbar");
    const snackText = document.getElementById("snackText");
    if (!snackbar || !snackText) return;
    snackText.textContent = msg;
    snackbar.className = "snackbar show " + (isSuccess ? "" : "remove");
    setTimeout(() => snackbar.classList.remove("show"), 2400);
  }

  /* ==================== PAYPAL INTEGRATION ==================== */
  function loadAndInitPayPal() {
    if (window.paypal) { initPayPalButtons(); return; }
    const loader = document.createElement('script');
    // REPLACE YOUR_CLIENT_ID with your actual PayPal Client ID
    loader.src = "https://www.paypal.com/sdk/js?client-id=test&currency=USD"; 
    loader.async = true;
    loader.onload = initPayPalButtons;
    document.head.appendChild(loader);
  }

  function initPayPalButtons() {
    const container = document.getElementById("paypal-button-container");
    const cart = getCart();
    if (!container || !window.paypal || cart.length === 0) return;
    container.innerHTML = '';
    paypal.Buttons({
      createOrder: (data, actions) => {
        const total = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
        return actions.order.create({ purchase_units: [{ amount: { value: total } }] });
      },
      onApprove: async (data, actions) => {
        const details = await actions.order.capture();
        window.location.href = `https://velutinx.github.io/success.html?orderID=${details.id}`;
      }
    }).render("#paypal-button-container");
  }

  // Global Exports
  window.translations = translations;
  window.getPriceForPack = getPriceForPack;
  window.formatPrice = formatPrice;
  window.getCart = getCart;
  window.addOrToggleCart = addOrToggleCart;
  window.updateCartDisplay = updateCartDisplay;
  window.removeItem = (idx) => {
    let cart = getCart(); cart.splice(idx, 1); saveCart(cart); updateCartDisplay();
    if (window.updateButton) window.updateButton();
  };
  window.setLanguage = (lang) => {
    currentLang = lang;
    currentCurrency = lang === "en" ? "USD" : lang === "ja" ? "JPY" : lang === "zh" ? "CNY" : "MXN";
    localStorage.setItem("language", lang);
    updateCartDisplay();
  };

  document.addEventListener("DOMContentLoaded", () => {
    updateCartDisplay();
    document.getElementById("cartBtn")?.addEventListener("click", () => {
      document.getElementById("cartDrawer")?.classList.toggle("open");
      if (getCart().length > 0) loadAndInitPayPal();
    });
    document.getElementById("cartClose")?.addEventListener("click", () => {
        document.getElementById("cartDrawer")?.classList.remove("open");
    });
  });
})();
