/* ==================== CONFIG & TRANSLATIONS ==================== */
const translations = {
  en: { 
    shopTitle: "My Store", filterTitle: "Filter by Category", catAll: "All", catNot: "Not On Booth", catFrom: "From Booth", catSisters: "The Sisters Corner", sortTitle: "Sort by", sortDefault: "Default", sortNewest: "Newest", sortLow: "Price: Low to High", sortHigh: "Price: High to Low", resetBtn: "Reset", productsTitle: "Products", cartTitle: "Shopping Cart", totalLabel: "Total", snackText: "Added successfully", loginBtn: "Website", searchPlaceholder: "Search...",
    confTitle: "Purchase Confirmed!", orderLabel: "Order Number:", readyLabel: "Your files are ready:", dlBtn: "Download", supportText: "Support: If you have any issues, please message me on Discord (velutinxx) or email support@velutinx.com.", idText: "Identification: When contacting support, please include your Order Number and your PayPal Email address.", noticeText: "Notice: Download links are valid for 24 hours. Please do not share these links with others."
  },
  ja: { 
    shopTitle: "マイストア", filterTitle: "カテゴリでフィルター", catAll: "すべて", catNot: "ブースにない", catFrom: "ブースから", catSisters: "シスターズコーナー", sortTitle: "並び替え", sortDefault: "デフォルト", sortNewest: "最新", sortLow: "価格: 低い → 高い", sortHigh: "価格: 高い → 低い", resetBtn: "リセット", productsTitle: "商品", cartTitle: "ショッピングカート", totalLabel: "合計", snackText: "カートに追加しました", loginBtn: "ウェブサイト", searchPlaceholder: "検索...",
    confTitle: "購入が完了しました！", orderLabel: "注文番号:", readyLabel: "ファイルの準備ができました:", dlBtn: "ダウンロード", supportText: "サポート：問題が発生した場合は、Discord（velutinxx）またはメール（support@velutinx.com）でご連絡ください。", idText: "本人確認：サポートに連絡する際は、注文番号とPayPalのメールアドレスを記載してください。", noticeText: "注意：ダウンロードリンクは24時間有効です。リンクを他人に共有しないでください。"
  },
  zh: { 
    shopTitle: "我的商店", filterTitle: "按类别筛选", catAll: "全部", catNot: "不在展位上", catFrom: "来自展位", catSisters: "姐妹角落", sortTitle: "排序方式", sortDefault: "默认", sortNewest: "最新", sortLow: "价格: 低到高", sortHigh: "价格: 高到低", resetBtn: "重置", productsTitle: "商品", cartTitle: "购物车", totalLabel: "总计", snackText: "已成功添加到购物车", loginBtn: "网站", searchPlaceholder: "搜索...",
    confTitle: "购买确认！", orderLabel: "订单编号:", readyLabel: "您的文件已准备就绪:", dlBtn: "下载", supportText: "支持：如果您有任何问题，请在 Discord (velutinxx) 上给我留言或发送邮件至 support@velutinx.com。", idText: "身份验证：联系支持人员时，请提供您的订单号和 PayPal 电子邮件地址。", noticeText: "注意：下载链接有效期为 24 小时。请勿与他人分享这些链接。"
  },
  es: { 
    shopTitle: "Mi Tienda", filterTitle: "Filtrar por Categoría", catAll: "Todos", catNot: "No en Booth", catFrom: "Desde Booth", catSisters: "El Rincón de las Hermanas", sortTitle: "Ordenar por", sortDefault: "Predeterminado", sortNewest: "Más reciente", sortLow: "Precio: Bajo a Alto", sortHigh: "Precio: Alto a Bajo", resetBtn: "Reiniciar", productsTitle: "Productos", cartTitle: "Carrito de Compras", totalLabel: "Total", snackText: "Añadido con éxito", loginBtn: "Sitio web", searchPlaceholder: "Buscar...",
    confTitle: "¡Compra Confirmada!", orderLabel: "Número de Pedido:", readyLabel: "Tus archivos están listos:", dlBtn: "Descargar", supportText: "Soporte: Si tienes algún problema, por favor escríbeme por Discord (velutinxx) o correo support@velutinx.com.", idText: "Identificación: Al contactar al soporte, por favor incluye tu número de pedido y tu correo de PayPal.", noticeText: "Aviso: Los enlaces de descarga son válidos por 24 horas. Por favor, no compartas estos enlaces."
  }
};

const tierMap = { 1.5: { JPY: 250, CNY: 10.5, MXN: 25 }, 3.0: { JPY: 500, CNY: 21.0, MXN: 50 }, 10.0: { JPY: 1500, CNY: 69.0, MXN: 175 } };
const approxRates = { JPY: 158, CNY: 6.9, MXN: 18 };

let currentLang = localStorage.getItem("language") || "en";
let currentCurrency = currentLang === "en" ? "USD" : currentLang === "ja" ? "JPY" : currentLang === "zh" ? "CNY" : "MXN";
window.cart = window.cart || [];
let isDark = localStorage.getItem("darkMode") === "true";

if (isDark) document.body.classList.add("dark");

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
  const ids = ["shopTitle","filterTitle","catAll","catNot","catFrom","catSisters","sortTitle","sortDefault","sortNewest","sortLow","sortHigh","resetBtn","productsTitle","cartTitle","totalLabel","snackText","loginBtn"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && t[id]) el.textContent = t[id];
  });
  
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.placeholder = t.searchPlaceholder;

  updateAllPrices();
  updateCartDisplay();
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang, currency: currentCurrency } }));
}

function updateCartDisplay() {
  const count = window.cart.length;
  const countEls = ["cartCount", "floatingCartCount"];
  countEls.forEach(id => {
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
  const langContainer = document.getElementById("langContainer");
  const popover = document.getElementById("languagePopover");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartClose = document.getElementById("cartClose");
  const themeBtn = document.getElementById("themeBtn");
  const cartBtn = document.getElementById("cartBtn");
  const floatCartBtn = document.getElementById("floatingCartBtn");
  const cartItems = document.getElementById("cartItems");

  if (langBtn && popover) {
    langBtn.addEventListener("click", e => {
      e.stopPropagation();
      popover.classList.toggle("show");
    });
  }

  document.addEventListener("click", e => {
    if (langContainer && popover && !langContainer.contains(e.target)) {
      popover.classList.remove("show");
    }
  });

  document.querySelectorAll(".lang-item").forEach(item => {
    item.addEventListener("click", () => {
      setLanguage(item.dataset.lang);
      if (popover) popover.classList.remove("show");
    });
  });

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      isDark = !isDark;
      document.body.classList.toggle("dark", isDark);
      localStorage.setItem("darkMode", isDark);
    });
  }

  const openCart = () => {
    if (cartDrawer) {
      cartDrawer.classList.add("open");
      document.body.classList.add("drawer-open");
    }
  };
  const closeCart = () => {
    if (cartDrawer) {
      cartDrawer.classList.remove("open");
      document.body.classList.remove("drawer-open");
    }
  };

  if (cartBtn) cartBtn.addEventListener("click", openCart);
  if (floatCartBtn) floatCartBtn.addEventListener("click", openCart);
  if (cartClose) cartClose.addEventListener("click", closeCart);

  document.addEventListener("click", e => {
    if (cartDrawer && cartDrawer.classList.contains("open")) {
      const isClickInside = cartDrawer.contains(e.target);
      const isCartToggle = (cartBtn && cartBtn.contains(e.target)) || (floatCartBtn && floatCartBtn.contains(e.target));
      if (!isClickInside && !isCartToggle) closeCart();
    }
  });

  if (cartItems) {
    cartItems.addEventListener("click", e => {
      if (e.target.classList.contains("cart-item-remove")) {
        const idx = parseInt(e.target.dataset.idx);
        window.cart.splice(idx, 1);
        updateCartDisplay();
      }
    });
  }

  updateCartDisplay();
  const t = translations[currentLang] || translations.en;
  const ids = ["shopTitle","filterTitle","catAll","catNot","catFrom","catSisters","sortTitle","sortDefault","sortNewest","sortLow","sortHigh","resetBtn","productsTitle","cartTitle","totalLabel","snackText","loginBtn"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && t[id]) el.textContent = t[id];
  });
  updateAllPrices();
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
        // 1. Get the items from the cart
        const cart = JSON.parse(localStorage.getItem("velutinx_cart") || "[]");
        const itemNames = cart.map(item => item.id.replace('item-', 'PACK').toUpperCase()).join(',');

        // 2. Prepare the data for Supabase
        const orderData = {
          paypal_token: details.id,
          paypal_email: details.payer.email_address,
          amount: details.purchase_units[0].amount ? details.purchase_units[0].amount.value : 0,
          cart: itemNames,
          status: 'COMPLETED'
        };

        // 3. Save to Supabase via your Cloudflare Function
        try {
          await fetch('/save-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
          });
        } catch (err) {
          console.error("Supabase Save Error:", err);
        }

        // 4. Redirect to success page
        window.location.href = `/success.html?token=${details.id}`;
      });
    },

    onError: (err) => {
      console.error("PayPal Error:", err);
    }
  }).render("#paypal-button-container");
}
