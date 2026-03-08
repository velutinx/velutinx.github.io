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
      catFemboy: "男の娘",
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

  let prices = { low: 1.5, med: 3.0, high: 10.0 };

  function getPriceForPack(pack) {
    switch (pack.price) {
      case "PRICE_LOW": return prices.low;
      case "PRICE_MED": return prices.med;
      case "PRICE_HIGH": return prices.high;
      default: return prices.med;
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
    let converted = value * (approxRates[currency] || 1);
    converted = (currency === "JPY" || currency === "MXN") ? Math.ceil(converted) : Math.ceil(converted * 10) / 10;
    const symbol = currency === "JPY" ? "円" : currency === "CNY" ? "元" : "MXN$";
    return `${symbol}${converted}`;
  }

  /* ==================== CART MANAGEMENT ==================== */
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
    let message = "";
    let isSuccess = true;

    if (index !== -1) {
      cart.splice(index, 1);
      message = translations[currentLang]?.removeFromCart || "Removed from cart";
      isSuccess = false;
    } else {
      cart.push({
        id: pack.id,
        title: pack.title,
        image: pack.image || (pack.images && pack.images[0]) || "",
        price: getPriceForPack(pack),
        quantity: 1
      });
      message = translations[currentLang]?.snackText || "Added successfully";
      isSuccess = true;
    }

    saveCart(cart);
    updateCartDisplay();
    showSnackbar(message, isSuccess);
    if (window.updateAllCartButtons) window.updateAllCartButtons();
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
            <button class="cart-item-remove" onclick="window.removeItem(${idx})">×</button>
          `;
          itemsEl.appendChild(div);
        });
      }
      const totalEl = document.getElementById("cartTotal");
      if (totalEl) totalEl.textContent = formatPrice(total);
    }
    if (window.initPayPalButtons) window.initPayPalButtons();
  }

  /* ==================== SNACKBAR ==================== */
  function showSnackbar(message, isSuccess = true) {
    const snackbar = document.getElementById("snackbar");
    if (!snackbar) return;
    const snackText = document.getElementById("snackText");
    if (snackText) snackText.textContent = message;

    snackbar.className = "snackbar show";
    snackbar.style.background = isSuccess ? "#22c55e" : "#ef4444";

    setTimeout(() => {
      snackbar.classList.remove("show");
    }, 2400);
  }

  /* ==================== PAYPAL INTEGRATION ==================== */
  function loadAndInitPayPal() {
    if (window.paypalLoaded) return;
    window.paypalLoaded = true;
    const loader = document.createElement('script');
loader.src = "/functions/paypal-sdk"; // or "/functions/paypal-sdk.js"
    loader.async = true;
    loader.onload = () => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (typeof window.paypal !== 'undefined') {
          clearInterval(interval);
          initPayPalButtons();
        } else if (attempts > 50) clearInterval(interval);
      }, 200);
    };
    document.head.appendChild(loader);
  }

  function initPayPalButtons() {
    const container = document.getElementById("paypal-button-container");
    if (!container || typeof paypal === 'undefined') return;
    container.innerHTML = '';
    paypal.Buttons({
      createOrder: (data, actions) => {
        const cart = getCart();
        const total = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
        return actions.order.create({
          purchase_units: [{ amount: { currency_code: "USD", value: total } }]
        });
      },
      onApprove: async (data, actions) => {
        const details = await actions.order.capture();
        window.location.href = `/success.html?orderID=${details.id}`;
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
  window.initPayPalButtons = initPayPalButtons;
  window.removeItem = (idx) => {
    let cart = getCart();
    cart.splice(idx, 1);
    saveCart(cart);
    updateCartDisplay();
  };

  document.addEventListener("DOMContentLoaded", () => {
    updateCartDisplay();
    const cartBtn = document.getElementById("cartBtn");
    cartBtn?.addEventListener("click", () => {
        document.getElementById("cartDrawer")?.classList.toggle("open");
        loadAndInitPayPal();
    });
  });
})();
