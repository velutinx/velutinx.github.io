(function () {
  "use strict";
/* ==================== TRANSLATIONS ==================== */
const translations = {
  en: {
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
    removeFromCart: "Remove from Cart",

    // Membership page
    membershipTitle: "✨ Choose Your Membership",
    membershipDescription: "Support my work and unlock exclusive perks",
    discordIdLabel: "Your Discord ID",
    discordHint: "How to find your Discord ID:",
    discordHelpLink: "Where do I find my Discord ID? (click)",
    discordHelpStep1: "<strong>Step 1:</strong> Open Discord and go to <strong>User Settings</strong> (gear icon).",
    discordHelpStep2: "<strong>Step 2:</strong> Under <strong>App Settings</strong>, select <strong>Advanced</strong> and enable <strong>Developer Mode</strong>.",
    discordHelpStep3: "<strong>Step 3:</strong> Right-click your username anywhere and select <strong>Copy ID</strong>.",
    discordHelpStep4: "<strong>Step 4:</strong> Paste that number here.",
    noteBox: "<strong>📌 Important:</strong> After successful payment, you'll receive the corresponding role in our Discord server automatically. Make sure you've joined the server first!",
    joinDiscord: "→ Join Discord Server ←",
    
    tierBronze: "Bronze",
    tierCopper: "Copper",
    tierSilver: "Silver",
    tierGold: "Gold",
    tierPlatinum: "Platinum",
    
    perMonth: "/ month",
    btnSingle: "Single Purchase",
    btnRecurring: "Recurring Membership",

    // Perk lines
    perk1_1: "Full archive access immediately.",
    perk1_2: "Includes all past releases & paid content.",
    perk2_1: "Everything in Bronze, plus:",
    perk2_2: "One (1) custom image request per billing cycle.",
    perk2_3: "Approx. 20 images per request.",
    perk2_4: "Single character, official/creator-selected outfit.",
    perk2_5: "Some character customization allowed.",
    perk2_6: "Typical turnaround: ~1 day (queue order).",
    perk3_1: "Everything in Bronze, plus:",
    perk3_2: "One (1) custom image request per billing cycle.",
    perk3_3: "Approx. 40 images per request.",
    perk3_4: "Single character, custom outfit allowed.",
    perk3_5: "Character customization allowed.",
    perk3_6: "Typical turnaround: ~1 day (queue order).",
    perk4_1: "Everything in Bronze, plus:",
    perk4_2: "One (1) large custom image request per billing cycle.",
    perk4_3: "Approx. 80 images per request.",
    perk4_4: "Single character, custom outfit allowed.",
    perk4_5: "Character customization allowed.",
    perk4_6: "Typical turnaround: 3-7 days (queue order).",
    perk4_7: "Special/expanded requests may be discussed.",
    perk5_1: "Everything in Bronze, plus:",
    perk5_2: "One (1) large custom image request per billing cycle.",
    perk5_3: "Approx. 80 images per request.",
    perk5_4: "Single character, custom outfit allowed.",
    perk5_5: "Character customization allowed.",
    perk5_6: "⚡ Priority: worked on first after current tasks.",
    perk5_7: "Typical turnaround: 3-7 days (once started).",

    // Snackbar messages
    errorDiscordMissing: "❌ Please enter your Discord ID",
    errorDiscordInvalid: "❌ Invalid Discord ID format",
    errorOnlyHighest: "❌ Only the highest tier can be added.",
    removedFromCart: "Removed from cart",
    addedToCart: "Added to cart",
    errorPlanNotConfigured: "❌ Plan not configured for this tier",
  },

  ja: {
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
    removeFromCart: "カートから削除",

    // Membership page
    membershipTitle: "✨ メンバーシップを選ぶ",
    membershipDescription: "私の活動を支援し、特典をアンロック",
    discordIdLabel: "Discord ID",
    discordHint: "Discord IDの見つけ方:",
    discordHelpLink: "Discord IDはどこで見つけられますか？ (クリック)",
    discordHelpStep1: "<strong>手順1:</strong> Discordを開き、<strong>ユーザー設定</strong>（歯車アイコン）へ。",
    discordHelpStep2: "<strong>手順2:</strong> <strong>アプリ設定</strong>の<strong>高度な設定</strong>で<strong>開発者モード</strong>を有効に。",
    discordHelpStep3: "<strong>手順3:</strong> 自分のユーザー名を右クリックし、<strong>IDをコピー</strong>。",
    discordHelpStep4: "<strong>手順4:</strong> その番号をここに貼り付け。",
    noteBox: "<strong>📌 重要:</strong> 支払い完了後、対応するロールが自動的に付与されます。事前にDiscordサーバーに参加してください！",
    joinDiscord: "→ Discordサーバーに参加 ←",

    tierBronze: "ブロンズ",
    tierCopper: "カッパー",
    tierSilver: "シルバー",
    tierGold: "ゴールド",
    tierPlatinum: "プラチナ",

    perMonth: "/月",
    btnSingle: "単発購入",
    btnRecurring: "定期購読",

    // Perk lines
    perk1_1: "アーカイブへの即時フルアクセス。",
    perk1_2: "過去の全リリースと有料コンテンツを含む。",
    perk2_1: "ブロンズの全特典に加えて：",
    perk2_2: "各請求サイクルに1回のカスタム画像リクエスト。",
    perk2_3: "1リクエストあたり約20枚。",
    perk2_4: "単一キャラクター、公式/クリエイター選択の衣装。",
    perk2_5: "一部キャラクターカスタマイズ可能。",
    perk2_6: "標準納期：〜1日（キュー順）。",
    perk3_1: "ブロンズの全特典に加えて：",
    perk3_2: "各請求サイクルに1回のカスタム画像リクエスト。",
    perk3_3: "1リクエストあたり約40枚。",
    perk3_4: "単一キャラクター、カスタム衣装可能。",
    perk3_5: "キャラクターカスタマイズ可能。",
    perk3_6: "標準納期：〜1日（キュー順）。",
    perk4_1: "ブロンズの全特典に加えて：",
    perk4_2: "各請求サイクルに1回の大規模カスタム画像リクエスト。",
    perk4_3: "1リクエストあたり約80枚。",
    perk4_4: "単一キャラクター、カスタム衣装可能。",
    perk4_5: "キャラクターカスタマイズ可能。",
    perk4_6: "標準納期：3〜7日（キュー順）。",
    perk4_7: "特別/拡張リクエストは相談可能。",
    perk5_1: "ブロンズの全特典に加えて：",
    perk5_2: "各請求サイクルに1回の大規模カスタム画像リクエスト。",
    perk5_3: "1リクエストあたり約80枚。",
    perk5_4: "単一キャラクター、カスタム衣装可能。",
    perk5_5: "キャラクターカスタマイズ可能。",
    perk5_6: "⚡ 優先対応：現在のタスク完了後に最初に着手。",
    perk5_7: "標準納期：3〜7日（着手後）。",

    // Snackbar messages
    errorDiscordMissing: "❌ Discord IDを入力してください",
    errorDiscordInvalid: "❌ Discord IDの形式が無効です",
    errorOnlyHighest: "❌ 最上位ティアのみ追加できます。",
    removedFromCart: "カートから削除しました",
    addedToCart: "カートに追加しました",
    errorPlanNotConfigured: "❌ このティアのプランは設定されていません",
  },

  zh: {
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
    removeFromCart: "从购物车移除",

    // Membership page
    membershipTitle: "✨ 选择会员资格",
    membershipDescription: "支持我的工作并解锁专属特权",
    discordIdLabel: "你的 Discord ID",
    discordHint: "如何找到你的 Discord ID:",
    discordHelpLink: "我在哪里可以找到我的 Discord ID？(点击)",
    discordHelpStep1: "<strong>步骤1:</strong> 打开 Discord，进入<strong>用户设置</strong>（齿轮图标）。",
    discordHelpStep2: "<strong>步骤2:</strong> 在<strong>应用设置</strong>中，选择<strong>高级</strong>并启用<strong>开发者模式</strong>。",
    discordHelpStep3: "<strong>步骤3:</strong> 右键点击你的用户名，选择<strong>复制ID</strong>。",
    discordHelpStep4: "<strong>步骤4:</strong> 将号码粘贴在这里。",
    noteBox: "<strong>📌 重要:</strong> 支付成功后，你将自动获得 Discord 服务器中的对应角色。请确保已加入服务器！",
    joinDiscord: "→ 加入 Discord 服务器 ←",

    tierBronze: "青铜",
    tierCopper: "铜",
    tierSilver: "银",
    tierGold: "金",
    tierPlatinum: "铂金",

    perMonth: "/月",
    btnSingle: "单次购买",
    btnRecurring: "定期订阅",

    // Perk lines
    perk1_1: "立即获得完整存档访问权限。",
    perk1_2: "包含所有过往发布及付费内容。",
    perk2_1: "包含青铜所有权益，外加：",
    perk2_2: "每个计费周期可提交1次定制图像请求。",
    perk2_3: "每次请求约20张图像。",
    perk2_4: "单一角色，官方/创作者选定服装。",
    perk2_5: "允许一定程度的角色自定义。",
    perk2_6: "通常交付时间：~1天（按队列顺序）。",
    perk3_1: "包含青铜所有权益，外加：",
    perk3_2: "每个计费周期可提交1次定制图像请求。",
    perk3_3: "每次请求约40张图像。",
    perk3_4: "单一角色，允许自定义服装。",
    perk3_5: "允许角色自定义。",
    perk3_6: "通常交付时间：~1天（按队列顺序）。",
    perk4_1: "包含青铜所有权益，外加：",
    perk4_2: "每个计费周期可提交1次大型定制图像请求。",
    perk4_3: "每次请求约80张图像。",
    perk4_4: "单一角色，允许自定义服装。",
    perk4_5: "允许角色自定义。",
    perk4_6: "通常交付时间：3-7天（按队列顺序）。",
    perk4_7: "特殊/扩展请求可商议。",
    perk5_1: "包含青铜所有权益，外加：",
    perk5_2: "每个计费周期可提交1次大型定制图像请求。",
    perk5_3: "每次请求约80张图像。",
    perk5_4: "单一角色，允许自定义服装。",
    perk5_5: "允许角色自定义。",
    perk5_6: "⚡ 优先处理：当前任务完成后最先处理。",
    perk5_7: "通常交付时间：3-7天（开始后）。",

    // Snackbar messages
    errorDiscordMissing: "❌ 请输入你的 Discord ID",
    errorDiscordInvalid: "❌ Discord ID 格式无效",
    errorOnlyHighest: "❌ 只能添加最高等级的会员资格。",
    removedFromCart: "已从购物车移除",
    addedToCart: "已加入购物车",
    errorPlanNotConfigured: "❌ 该等级尚未配置订阅方案",
  },

  es: {
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
    removeFromCart: "Eliminar del carrito",

    // Membership page
    membershipTitle: "✨ Elige tu Membresía",
    membershipDescription: "Apoya mi trabajo y desbloquea beneficios exclusivos",
    discordIdLabel: "Tu ID de Discord",
    discordHint: "Cómo encontrar tu ID de Discord:",
    discordHelpLink: "¿Dónde encuentro mi ID de Discord? (clic)",
    discordHelpStep1: "<strong>Paso 1:</strong> Abre Discord y ve a <strong>Ajustes de Usuario</strong> (icono de engranaje).",
    discordHelpStep2: "<strong>Paso 2:</strong> En <strong>Ajustes de la App</strong>, selecciona <strong>Avanzado</strong> y activa <strong>Modo Desarrollador</strong>.",
    discordHelpStep3: "<strong>Paso 3:</strong> Haz clic derecho en tu nombre de usuario y selecciona <strong>Copiar ID</strong>.",
    discordHelpStep4: "<strong>Paso 4:</strong> Pega ese número aquí.",
    noteBox: "<strong>📌 Importante:</strong> Después del pago exitoso, recibirás el rol correspondiente en nuestro servidor de Discord automáticamente. ¡Asegúrate de haber entrado al servidor primero!",
    joinDiscord: "→ Unirse al Servicio de Discord ←",

    tierBronze: "Bronce",
    tierCopper: "Cobre",
    tierSilver: "Plata",
    tierGold: "Oro",
    tierPlatinum: "Platino",

    perMonth: "/ mes",
    btnSingle: "Compra Única",
    btnRecurring: "Membresía Recurrente",

    // Perk lines
    perk1_1: "Acceso inmediato al archivo completo.",
    perk1_2: "Incluye todos los lanzamientos anteriores y contenido de pago.",
    perk2_1: "Todo lo de Bronce, más:",
    perk2_2: "Una (1) solicitud de imagen personalizada por ciclo de facturación.",
    perk2_3: "Aprox. 20 imágenes por solicitud.",
    perk2_4: "Personaje único, atuendo seleccionado por el oficial/creador.",
    perk2_5: "Se permite cierta personalización del personaje.",
    perk2_6: "Tiempo de entrega típico: ~1 día (orden de cola).",
    perk3_1: "Todo lo de Bronce, más:",
    perk3_2: "Una (1) solicitud de imagen personalizada por ciclo de facturación.",
    perk3_3: "Aprox. 40 imágenes por solicitud.",
    perk3_4: "Personaje único, se permite atuendo personalizado.",
    perk3_5: "Se permite personalización del personaje.",
    perk3_6: "Tiempo de entrega típico: ~1 día (orden de cola).",
    perk4_1: "Todo lo de Bronce, más:",
    perk4_2: "Una (1) solicitud de imagen personalizada grande por ciclo de facturación.",
    perk4_3: "Aprox. 80 imágenes por solicitud.",
    perk4_4: "Personaje único, se permite atuendo personalizado.",
    perk4_5: "Se permite personalización del personaje.",
    perk4_6: "Tiempo de entrega típico: 3-7 días (orden de cola).",
    perk4_7: "Solicitudes especiales/ampliadas pueden ser discutidas.",
    perk5_1: "Todo lo de Bronce, más:",
    perk5_2: "Una (1) solicitud de imagen personalizada grande por ciclo de facturación.",
    perk5_3: "Aprox. 80 imágenes por solicitud.",
    perk5_4: "Personaje único, se permite atuendo personalizado.",
    perk5_5: "Se permite personalización del personaje.",
    perk5_6: "⚡ Prioridad: se trabaja primero después de las tareas actuales.",
    perk5_7: "Tiempo de entrega típico: 3-7 días (una vez iniciado).",

    // Snackbar messages
    errorDiscordMissing: "❌ Por favor ingresa tu ID de Discord",
    errorDiscordInvalid: "❌ Formato de ID de Discord inválido",
    errorOnlyHighest: "❌ Solo se puede agregar el nivel más alto.",
    removedFromCart: "Eliminado del carrito",
    addedToCart: "Añadido al carrito",
    errorPlanNotConfigured: "❌ Plan no configurado para este nivel",
  }
};


  /* ==================== HELPER: GET CURRENT LANGUAGE ==================== */
  function getCurrentLang() {
    return localStorage.getItem("language") || "en";
  }

  /* ==================== PRICE & CURRENCY ==================== */
  const tierMap = {
    1.5: { JPY: 250, CNY: 10.5, MXN: 25 },
    3.0: { JPY: 500, CNY: 21.0, MXN: 50 },
    10.0: { JPY: 1500, CNY: 69.0, MXN: 175 }
  };

  const approxRates = { JPY: 158, CNY: 6.9, MXN: 18 };

  function getCurrentCurrency() {
    const lang = getCurrentLang();
    return lang === "en" ? "USD" :
           lang === "ja" ? "JPY" :
           lang === "zh" ? "CNY" : "MXN";
  }

  let prices = { low: 1.5, med: 3.0, high: 10.0 };

  function getPriceForPack(pack) {
    switch (pack.price) {
      case "PRICE_LOW": return prices.low;
      case "PRICE_MED": return prices.med;
      case "PRICE_HIGH": return prices.high;
      default: return prices.med;
    }
  }

  function formatPrice(value, currency) {
    // Ensure value is a number
    const num = Number(value);
    if (isNaN(num)) return "?";
    if (currency === undefined) currency = getCurrentCurrency();
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
    const lang = getCurrentLang();

    if (index !== -1) {
      cart.splice(index, 1);
      message = translations[lang]?.removeFromCart || "Removed from cart";
      isSuccess = false;
    } else {
      const paddedId = pack.id.padStart(3, '0');
      const imageUrl = `https://www.velutinx.com/i/pack${paddedId}-1.jpg`;

      const newItem = {
        id: pack.id,
        title: pack.title,
        image: imageUrl,
        price: pack.price !== undefined ? Number(pack.price) : getPriceForPack(pack),
        quantity: 1
      };
      if (pack.type) newItem.type = pack.type;
      if (pack.tier) newItem.tier = pack.tier;
      if (pack.discordId) newItem.discordId = pack.discordId;

      cart.push(newItem);
      message = translations[lang]?.snackText || "Added successfully";
      isSuccess = true;
    }

    saveCart(cart);
    updateCartDisplay();
    showSnackbar(message, isSuccess);

    if (window.updateAllCartButtons) window.updateAllCartButtons();
  }

  function updateCartDisplay() {
    const drawer = document.getElementById("cartDrawer");
    const wasOpen = drawer?.classList.contains("open");

    const cart = getCart();
    const count = cart.length;
    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);

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
            <button class="cart-item-remove" data-index="${idx}">×</button>
          `;
          itemsEl.appendChild(div);
        });
      }
      const totalEl = document.getElementById("cartTotal");
      if (totalEl) totalEl.textContent = formatPrice(total);
    }

    // Remove handlers
    document.querySelectorAll(".cart-item-remove").forEach(btn => {
      btn.addEventListener("click", function(e) {
        e.stopPropagation();
        e.preventDefault();
        const idx = parseInt(this.dataset.index);
        let cart = getCart();
        cart.splice(idx, 1);
        saveCart(cart);
        updateCartDisplay();
      });
    });

    // Sync product buttons
    document.querySelectorAll(".product-card").forEach(card => {
      const id = card.dataset.id;
      const btn = card.querySelector(".cart-btn");
      if (!btn) return;
      const inCart = cart.some(item => item.id == id);
      btn.classList.toggle("added", inCart);
    });

    if (wasOpen) drawer?.classList.add("open");

    // Refresh PayPal buttons
    if (window.initPayPalButtons) {
      setTimeout(() => {
        window.initPayPalButtons();
      }, 50);
    }
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

/* ==================== PAYPAL ==================== */

let paypalButtonsRendered = false;

function initPayPalButtons() {
  const container = document.getElementById("paypal-button-container");
  const drawer = document.getElementById("cartDrawer");

  if (!container || !drawer || !drawer.classList.contains("open")) return;
  if (paypalButtonsRendered) return;
  if (typeof paypal === 'undefined') {
    console.warn('PayPal SDK not loaded yet');
    return;
  }

  container.innerHTML = '';

  paypal.Buttons({
    createOrder: async (data, actions) => {
      const cart = getCart();
      if (cart.length === 0) {
        alert("Your cart is empty.");
        return Promise.reject("Cart is empty");
      }

      const payload = {
        items: cart.map(item => ({
          id: item.id,
          title: item.title || `Pack ${item.id}`,
          tier: item.price?.toFixed(2) || item.tier || "3.00",
          quantity: item.quantity || 1
        }))
      };

      try {
        const response = await fetch('https://secure-checkout.velutinx.workers.dev/api/create-paypal-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Server rejected request");

        const serverData = await response.json();
        if (!serverData.success) throw new Error(serverData.error || "Validation failed");

        console.log('[SECURE] Using server-validated total:', serverData.purchase_units[0].amount.value);

        return actions.order.create({
          purchase_units: serverData.purchase_units
        });

      } catch (err) {
        console.warn("Secure price check failed — using fallback total");
        const clientTotal = cart.reduce((sum, item) => sum + Number(item.price || 0), 0).toFixed(2);
        return actions.order.create({
          purchase_units: [{ amount: { currency_code: "USD", value: clientTotal } }]
        });
      }
    },

    onApprove: async (data, actions) => {
      try {
        const details = await actions.order.capture();
        const cart = getCart();

        if (cart.some(item => item.type === 'membership')) {
          const item = cart.find(i => i.type === 'membership');
          await fetch('https://d.velutinx.com/api/capture-membership-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: details.id, tier: item.tier, discordId: item.discordId })
          });
          window.location.href = `/s/success.html?orderID=${details.id}&type=membership`;
        } else {
          const total = parseFloat(details.purchase_units[0].amount.value);
          await fetch('https://velutinx-paypal-worker.velutinx.workers.dev/api/store-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID: details.id, items: cart, payerEmail: details.payer?.email_address || null, amount: total })
          });
          window.location.href = `/s/success.html?orderID=${details.id}`;
        }
      } catch (err) {
        console.error(err);
        alert('Payment successful but finalization failed. Contact support with Order ID: ' + data.orderID);
      }
    },

    onError: (err) => {
      console.error('PayPal error:', err);
      alert('PayPal encountered an error. Please try again.');
    }
  }).render("#paypal-button-container").then(() => {
    paypalButtonsRendered = true;
  });
}

function loadAndInitPayPal() {
  if (window.paypalLoaded) {
    initPayPalButtons();
    return;
  }
  window.paypalLoaded = true;

  const loader = document.createElement('script');
  loader.src = "https://www.paypal.com/sdk/js?client-id=AR7igvBzCZr6spSQ8DswwyQ28fU5U9hY0JwFGHcQmI7NZ5M8kvgPAqqQEN9xPPo5E1UNl-om-OWnscI3&currency=USD";
  loader.async = true;
  loader.onload = () => initPayPalButtons();
  document.head.appendChild(loader);
}

/* ==================== DOM INITIALIZATION ==================== */

document.addEventListener("DOMContentLoaded", () => {
  injectSidebar();           // ← Auto-adds sidebar on every page
  updateCartDisplay();

  const openDrawer = () => {
    const drawer = document.getElementById("cartDrawer");
    if (!drawer) return;
    drawer.classList.add("open");
    loadAndInitPayPal();
  };

  const closeDrawer = () => {
    const drawer = document.getElementById("cartDrawer");
    if (!drawer) return;
    drawer.classList.remove("open");
    paypalButtonsRendered = false;
  };

  document.getElementById("cartBtn")?.addEventListener("click", openDrawer);
  document.getElementById("floatingCartBtn")?.addEventListener("click", openDrawer);
  document.getElementById("cartClose")?.addEventListener("click", closeDrawer);

  document.addEventListener("click", (e) => {
    const drawer = document.getElementById("cartDrawer");
    if (!drawer?.classList.contains("open")) return;
    if (!drawer.contains(e.target) && 
        !document.getElementById("cartBtn")?.contains(e.target) &&
        !document.getElementById("floatingCartBtn")?.contains(e.target)) {
      closeDrawer();
    }
  });

  // Sidebar toggle
  const menuToggle = document.getElementById('menuToggle');
  const sidebarMenuToggle = document.getElementById('sidebarMenuToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  menuToggle?.addEventListener('click', () => {
    sidebar?.classList.add('open');
    sidebarOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  sidebarMenuToggle?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    sidebarOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  });

  sidebarOverlay?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    sidebarOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// ==================== AUTO-INJECT SIDEBAR FUNCTION ====================
function injectSidebar() {
  if (document.getElementById("sidebar")) return;

  const sidebarHTML = `
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <button class="sidebar-menu-toggle" id="sidebarMenuToggle">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <div class="logo">VELUTINX</div>
      </div>
      <div class="sidebar-menu">
        <a href="https://velutinx.com/" class="menu-item"><svg viewBox="0 0 24 24"><path d="M3 9L12 3L21 9L12 15L3 9Z" stroke="currentColor" fill="none"/><path d="M5 12v6h14v-6" stroke="currentColor" fill="none"/></svg><span>HOME</span></a>
        <a href="https://velutinx.com/commission" class="menu-item"><svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" stroke="currentColor" fill="none"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor"/></svg><span>COMMISSIONS</span></a>
        <a href="https://velutinx.com/artwork" class="menu-item"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor"/><path d="M7 7l2 2M17 7l-2 2M7 17l2-2M17 17l-2-2" stroke="currentColor"/></svg><span>ARTWORK</span></a>
        <a href="https://velutinx.com/poll" class="menu-item"><svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" stroke="currentColor" fill="none"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor"/><path d="M16 4v16" stroke="currentColor"/></svg><span>POLL</span></a>
        <a href="https://velutinx.com/store" class="menu-item"><svg viewBox="0 0 24 24"><path d="M3 9L12 3L21 9L12 15L3 9Z" stroke="currentColor" fill="none"/><path d="M5 12v6h14v-6" stroke="currentColor" fill="none"/><circle cx="12" cy="15" r="2" stroke="currentColor"/></svg><span>STORE</span></a>
        <a href="https://velutinx.com/contact" class="menu-item"><svg viewBox="0 0 24 24"><path d="M4 4h16v12H4z" stroke="currentColor" fill="none"/><path d="M22 6L12 13L2 6" stroke="currentColor"/></svg><span>CONTACT</span></a>
      </div>
      <div class="sidebar-footer">
        <p>© VELUTINX</p>
      </div>
    </aside>
  `;

  document.body.insertAdjacentHTML("beforeend", sidebarHTML);
}
window.loadAndInitPayPal = loadAndInitPayPal;
window.initPayPalButtons = initPayPalButtons;
window.updateCartDisplay = updateCartDisplay;
// add the other ones you already have, plus any missing
// Close the IIFE (this was missing!)
})();   // ←←← THIS LINE IS CRITICAL
