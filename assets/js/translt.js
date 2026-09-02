// translations.js – now at assets/js/translt.js
const SUPPORTED_LANGUAGES = ['en', 'ja', 'zh', 'es'];
const DEFAULT_LANG = 'en';

const translations = {
  index: {
    en: { heroSub: "♡ Freelance Illustrator ♡", heroSubExtra: "🇺🇸 / 🇯🇵 / 🇪🇸 = OK!" },
    ja: { heroSub: "♡ フリーランスイラストレーター ♡", heroSubExtra: "🇺🇸 / 🇯🇵 / 🇪🇸 = OK!" },
    zh: { heroSub: "♡ 自由插画师 ♡", heroSubExtra: "🇺🇸 / 🇯🇵 / 🇪🇸 = 可以！" },
    es: { heroSub: "♡ Ilustradora Freelance ♡", heroSubExtra: "🇺🇸 / 🇯🇵 / 🇪🇸 = ¡OK!" }
  },
  artwork: {
    en: { artworkIntro: "Hello! These are just a few small samples of my artwork — I share a lot more on my free Discord! — Temporal Images" },
    ja: { artworkIntro: "こんにちは！こちらは作品サンプルの一部です。無料Discordではさらに多く公開しています！ — Temporal Images" },
    zh: { artworkIntro: "你好！这些只是我作品的一小部分样本——我在免费Discord上分享更多！ — Temporal Images" },
    es: { artworkIntro: "¡Hola! Estas son solo algunas pequeñas muestras de mi arte — ¡comparto mucho más en mi Discord gratuito! — Temporal Images" }
  },
  commissions: {
    en: {
      pageTitle: "COMMISSIONS & TIERS",
      tierBronze: "Bronze",
      tierCopper: "Copper",
      tierSilver: "Silver",
      tierGold: "Gold",
      perkBronze: "Full archive access + all past releases & paid content.",
      perkCopper1: "Everything in Bronze, plus one custom request per billing cycle.",
      perkCopper2: "~80 images · official/creator-selected outfit · some customisation.",
      perkSilver1: "Everything in Bronze, plus one custom request per billing cycle.",
      perkSilver2: "~80 images · custom outfit · full character customisation.",
      perkGold1: "Everything in Bronze, plus one <strong>large</strong> custom request per billing cycle.",
      perkGold2: "~80 images · custom outfit · full character customisation.",
      badgeArchive: "Archive Access",
      badge1Request: "1 Request",
      badge1LargeRequest: "1 Large Request",
      queueLabel: "📋 Current Queue Status",
      queueLive: "Live — next in line:",
      queueLoading: "Loading queue…",
      queueEmpty: "Queue is empty ✨",
      queueError: "Could not load queue.",
      footerLink: "💡 Full tier details, pricing & sign‑up",
      footerNote: "✦ Subscribing on any platform (Patreon, SubscribeStar, Ko‑fi, or the website) grants you full access to all releases on Discord. ✦"
    },
    ja: {
      pageTitle: "コミッション & ティア",
      tierBronze: "ブロンズ",
      tierCopper: "カッパー",
      tierSilver: "シルバー",
      tierGold: "ゴールド",
      perkBronze: "全アーカイブアクセス + 過去の全リリースと有料コンテンツを含む。",
      perkCopper1: "ブロンズの全特典に加え、各請求サイクルに1回のカスタムリクエスト。",
      perkCopper2: "約80枚 · 公式/クリエイター選択の衣装 · 一部カスタマイズ可能。",
      perkSilver1: "ブロンズの全特典に加え、各請求サイクルに1回のカスタムリクエスト。",
      perkSilver2: "約80枚 · カスタム衣装 · フルキャラクターカスタマイズ。",
      perkGold1: "「ブロンズ」の全内容に加え、請求サイクルごとに<strong>大規模</strong>なカスタムリクエストを1件承ります。",
      perkGold2: "約80枚 · カスタム衣装 · フルキャラクターカスタマイズ。",
      badgeArchive: "アーカイブアクセス",
      badge1Request: "1リクエスト",
      badge1LargeRequest: "1大規模リクエスト",
      queueLabel: "📋 現在のキュー状況",
      queueLive: "ライブ — 次の順番：",
      queueLoading: "キューを読み込み中…",
      queueEmpty: "キューは空です ✨",
      queueError: "キューを読み込めませんでした。",
      footerLink: "💡 完全なティア詳細、価格、サインアップ",
      footerNote: "✦ Patreon、SubscribeStar、Ko‑fi、またはウェブサイトのいずれかのプラットフォームで購読すると、Discord上のすべてのリリースにフルアクセスできます。 ✦"
    },
    zh: {
      pageTitle: "委托与等级",
      tierBronze: "青铜",
      tierCopper: "铜",
      tierSilver: "银",
      tierGold: "金",
      perkBronze: "完整档案访问权限 + 所有过往发布及付费内容。",
      perkCopper1: "包含青铜所有权益，外加每个计费周期一次自定义请求。",
      perkCopper2: "约80张图片 · 官方/创作者选定服装 · 部分自定义。",
      perkSilver1: "包含青铜所有权益，外加每个计费周期一次自定义请求。",
      perkSilver2: "约80张图片 · 自定义服装 · 完全角色自定义。",
      perkGold1: "包含“青铜”级的所有权益，外加每个计费周期一次<strong>大型</strong>定制请求。",
      perkGold2: "约80张图片 · 自定义服装 · 完全角色自定义。",
      badgeArchive: "档案访问",
      badge1Request: "1次请求",
      badge1LargeRequest: "1次大型请求",
      queueLabel: "📋 当前队列状态",
      queueLive: "实时 — 下一个：",
      queueLoading: "正在加载队列…",
      queueEmpty: "队列为空 ✨",
      queueError: "无法加载队列。",
      footerLink: "💡 完整等级详情、价格及注册",
      footerNote: "✦ 在任何平台（Patreon、SubscribeStar、Ko‑fi 或网站）订阅，即可获得 Discord 上所有发布的完整访问权限。 ✦"
    },
    es: {
      pageTitle: "COMISIONES Y NIVELES",
      tierBronze: "Bronce",
      tierCopper: "Cobre",
      tierSilver: "Plata",
      tierGold: "Oro",
      perkBronze: "Acceso completo al archivo + todos los lanzamientos anteriores y contenido de pago.",
      perkCopper1: "Todo lo de Bronce, más una solicitud personalizada por ciclo de facturación.",
      perkCopper2: "~80 imágenes · atuendo oficial/seleccionado por el creador · alguna personalización.",
      perkSilver1: "Todo lo de Bronce, más una solicitud personalizada por ciclo de facturación.",
      perkSilver2: "~80 imágenes · atuendo personalizado · personalización completa del personaje.",
      perkGold1: "Todo lo de Bronce, más una solicitud personalizada <strong>grande</strong> por ciclo de facturación.",
      perkGold2: "~80 imágenes · atuendo personalizado · personalización completa del personaje.",
      badgeArchive: "Acceso al Archivo",
      badge1Request: "1 Solicitud",
      badge1LargeRequest: "1 Solicitud Grande",
      queueLabel: "📋 Estado actual de la cola",
      queueLive: "En vivo — próximo en la fila:",
      queueLoading: "Cargando cola…",
      queueEmpty: "La cola está vacía ✨",
      queueError: "No se pudo cargar la cola.",
      footerLink: "💡 Detalles completos de niveles, precios y registro",
      footerNote: "✦ Suscribirte en cualquier plataforma (Patreon, SubscribeStar, Ko‑fi o el sitio web) te da acceso completo a todos los lanzamientos en Discord. ✦"
    }
  },
  contact: {
    en: {
      contactTitle: "CONTACT",
      contactDesc: "Use this form if you'd like to contact me via email!",
      labelName: "NAME",
      labelEmail: "EMAIL",
      labelMessage: "MESSAGE",
      namePlaceholder: "Name",
      emailPlaceholder: "Email",
      messagePlaceholder: "Message",
      sendBtn: "SEND",
      errorText: "Please fill out all fields correctly ♡",
      successText: "Message sent successfully! You will hear back soon! ♡♡"
    },
    ja: {
      contactTitle: "お問い合わせ",
      contactDesc: "メールで連絡したい場合はこちらのフォームをご利用ください。",
      labelName: "お名前",
      labelEmail: "メールアドレス",
      labelMessage: "メッセージ",
      namePlaceholder: "お名前",
      emailPlaceholder: "メールアドレス",
      messagePlaceholder: "メッセージ",
      sendBtn: "送信",
      errorText: "すべての項目を正しく入力してください ♡",
      successText: "送信されました！近日中にご連絡します ♡♡"
    },
    zh: {
      contactTitle: "联系",
      contactDesc: "如果您想通过电子邮件联系我，请使用此表单！",
      labelName: "姓名",
      labelEmail: "电子邮件",
      labelMessage: "消息",
      namePlaceholder: "姓名",
      emailPlaceholder: "电子邮件",
      messagePlaceholder: "消息",
      sendBtn: "发送",
      errorText: "请正确填写所有字段 ♡",
      successText: "消息已发送！您很快会收到回复！ ♡♡"
    },
    es: {
      contactTitle: "CONTACTO",
      contactDesc: "¡Use este formulario si desea contactarme por correo electrónico!",
      labelName: "NOMBRE",
      labelEmail: "CORREO ELECTRÓNICO",
      labelMessage: "MENSAJE",
      namePlaceholder: "Nombre",
      emailPlaceholder: "Correo electrónico",
      messagePlaceholder: "Mensaje",
      sendBtn: "ENVIAR",
      errorText: "Por favor complete todos los campos correctamente ♡",
      successText: "¡Mensaje enviado con éxito! ¡Pronto tendrá noticias mías! ♡♡"
    }
  },
  poll: {
    en: {
      pollTitle: "Vote for Your Favorite Character",
      pollSubtitle: "Click once — you can change your vote anytime",
      leaderboardTitle: "Leaderboard",
      leaderboardTooltip: "Website + Discord votes",
      discordDisclaimer: "Join discord for an extra vote!!"
    },
    ja: {
      pollTitle: "お気に入りのキャラクターに投票",
      pollSubtitle: "一度クリック — いつでも投票を変更できます",
      leaderboardTitle: "リーダーボード",
      leaderboardTooltip: "ウェブサイト + Discord 投票",
      discordDisclaimer: "追加投票のためにDiscordに参加!!"
    },
    zh: {
      pollTitle: "为你最喜欢的角色投票",
      pollSubtitle: "点击一次 — 随时可以更改投票",
      leaderboardTitle: "排行榜",
      leaderboardTooltip: "网站 + Discord 投票",
      discordDisclaimer: "加入Discord获得额外一票!!"
    },
    es: {
      pollTitle: "Vota por tu personaje favorito",
      pollSubtitle: "Haz clic una vez — puedes cambiar tu voto cuando quieras",
      leaderboardTitle: "Tabla de clasificación",
      leaderboardTooltip: "Votos del sitio web + Discord",
      discordDisclaimer: "¡Únete al Discord para un voto extra!!"
    }
  },
  store: {
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
      searchPlaceholder: "Search products...",
      disclaimerAge: "Disclaimer: All characters depicted are portrayed as 18+. This is a fictional, consensual depiction.",
      disclaimerRefund: "Digital products are non-refundable after purchase.",
      contentsTitle: "Contents:",
      contentsDesc: "ZIP file containing {count} AI-generated illustrations",
      originalPrice: "Original Price:",
      currentPrice: "Current Price:",
      addToCart: "Add to Cart",
      removeFromCart: "Remove from Cart",
      websiteBtn: "Website"
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
      searchPlaceholder: "商品を検索...",
      disclaimerAge: "免責事項：描かれているすべてのキャラクターは18歳以上として描かれています。これはフィクションであり、合意に基づく描写です。",
      disclaimerRefund: "デジタル商品は購入後の返金はできません。",
      contentsTitle: "内容：",
      contentsDesc: "{count}枚のAI生成イラストを含むZIPファイル",
      originalPrice: "元の価格：",
      currentPrice: "現在の価格：",
      addToCart: "カートに追加",
      removeFromCart: "カートから削除",
      websiteBtn: "ウェブサイト"
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
      searchPlaceholder: "搜索商品...",
      disclaimerAge: "免责声明：所有描绘的角色均被描绘为18岁以上。这是虚构的、双方同意的描绘。",
      disclaimerRefund: "数字产品购买后不可退款。",
      contentsTitle: "内容：",
      contentsDesc: "包含 {count} 张 AI 生成插图的 ZIP 文件",
      originalPrice: "原价：",
      currentPrice: "现价：",
      addToCart: "加入购物车",
      removeFromCart: "从购物车移除",
      websiteBtn: "网站"
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
      searchPlaceholder: "Buscar productos...",
      disclaimerAge: "Descargo de responsabilidad: Todos los personajes representados se muestran como mayores de 18 años. Esta es una representación ficticia y consensuada.",
      disclaimerRefund: "Los productos digitales no son reembolsables después de la compra.",
      contentsTitle: "Contenido:",
      contentsDesc: "Archivo ZIP que contiene {count} ilustraciones generadas por IA",
      originalPrice: "Precio original:",
      currentPrice: "Precio actual:",
      addToCart: "Añadir al carrito",
      removeFromCart: "Eliminar del carrito",
      websiteBtn: "Website"
    }
  },
  header: {
    en: {
      storeBtn: "Store",
      menuHome: "HOME",
      menuCommissions: "COMMISSIONS",
      menuArtwork: "ARTWORK",
      menuPoll: "POLL",
      menuStore: "STORE",
      menuContact: "CONTACT",
      cartTitle: "Shopping Cart",
      totalLabel: "Total",
      snackText: "Added successfully"
    },
    ja: {
      storeBtn: "ストア",
      menuHome: "ホーム",
      menuCommissions: "コミッション",
      menuArtwork: "作品",
      menuPoll: "投票",
      menuStore: "ストア",
      menuContact: "お問い合わせ",
      cartTitle: "ショッピングカート",
      totalLabel: "合計",
      snackText: "カートに追加しました"
    },
    zh: {
      storeBtn: "商店",
      menuHome: "主页",
      menuCommissions: "委托",
      menuArtwork: "作品",
      menuPoll: "投票",
      menuStore: "商店",
      menuContact: "联系",
      cartTitle: "购物车",
      totalLabel: "总计",
      snackText: "已成功添加到购物车"
    },
    es: {
      storeBtn: "Tienda",
      menuHome: "INICIO",
      menuCommissions: "COMISIONES",
      menuArtwork: "OBRAS",
      menuPoll: "ENCUESTA",
      menuStore: "TIENDA",
      menuContact: "CONTACTO",
      cartTitle: "Carrito de Compras",
      totalLabel: "Total",
      snackText: "Añadido con éxito"
    }
  }
};

let currentLanguage = localStorage.getItem('language') || DEFAULT_LANG;
if (!SUPPORTED_LANGUAGES.includes(currentLanguage)) {
  currentLanguage = DEFAULT_LANG;
  localStorage.setItem('language', DEFAULT_LANG);
}

/**
 * Synchronize the internal language without dispatching an event.
 * This is used by the header (shared.js) to keep translations in sync.
 */
function syncLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.includes(lang)) lang = DEFAULT_LANG;
  if (lang === currentLanguage) return;
  currentLanguage = lang;
  window.currentLanguage = lang;
  localStorage.setItem('language', lang);
}

/**
 * Public setLanguage – updates the language and dispatches an event.
 * Only dispatches if the language actually changes.
 */
function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.includes(lang)) lang = DEFAULT_LANG;
  if (lang === currentLanguage) return; // no change
  currentLanguage = lang;
  window.currentLanguage = lang;
  localStorage.setItem('language', lang);

  const swipe = document.getElementById('langSwipe');
  if (swipe) {
    swipe.classList.remove('active');
    void swipe.offsetHeight;
    swipe.classList.add('active');
  }

  document.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
}

function applyTranslations(pageKey) {
  const pageTranslations = translations[pageKey]?.[currentLanguage] || translations[pageKey]?.[DEFAULT_LANG];
  if (!pageTranslations) return;

  if (pageKey === 'index') {
    const heroSubEl = document.getElementById('heroSub');
    if (heroSubEl && pageTranslations.heroSub) {
      heroSubEl.textContent = pageTranslations.heroSub;
    }
  } else if (pageKey === 'artwork') {
    const introEl = document.getElementById('artworkIntro');
    if (introEl && pageTranslations.artworkIntro) {
      introEl.textContent = pageTranslations.artworkIntro;
    }
  } else if (pageKey === 'commissions') {
    // The new detailed commissions translations are applied by format.js
    // This legacy applyTranslations is kept for backward compatibility.
    const titleEl = document.getElementById('comTitle');
    if (titleEl) titleEl.textContent = pageTranslations.pageTitle || pageTranslations.comTitle || '';
    const infoEl = document.getElementById('comInfo');
    if (infoEl) infoEl.textContent = pageTranslations.comInfo || '';
    const listEl = document.getElementById('comList');
    if (listEl) listEl.innerHTML = pageTranslations.comList?.trim() || '';
  } else if (pageKey === 'contact') {
    const titleEl = document.getElementById('contactTitle');
    if (titleEl) titleEl.textContent = pageTranslations.contactTitle || '';
    const descEl = document.getElementById('contactDesc');
    if (descEl) descEl.textContent = pageTranslations.contactDesc || '';
    const labelName = document.getElementById('labelName');
    if (labelName) labelName.textContent = pageTranslations.labelName || '';
    const labelEmail = document.getElementById('labelEmail');
    if (labelEmail) labelEmail.textContent = pageTranslations.labelEmail || '';
    const labelMessage = document.getElementById('labelMessage');
    if (labelMessage) labelMessage.textContent = pageTranslations.labelMessage || '';
    const nameInput = document.getElementById('name');
    if (nameInput) nameInput.placeholder = pageTranslations.namePlaceholder || '';
    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.placeholder = pageTranslations.emailPlaceholder || '';
    const messageInput = document.getElementById('message');
    if (messageInput) messageInput.placeholder = pageTranslations.messagePlaceholder || '';
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) sendBtn.textContent = pageTranslations.sendBtn || '';
  } else if (pageKey === 'poll') {
    const titleEl = document.querySelector('.poll-title');
    if (titleEl) titleEl.textContent = pageTranslations.pollTitle || '';
    const subtitleEl = document.querySelector('.poll-subtitle');
    if (subtitleEl) subtitleEl.textContent = pageTranslations.pollSubtitle || '';
    const leaderboardTitleEl = document.querySelector('#leaderboard h3');
    if (leaderboardTitleEl) leaderboardTitleEl.textContent = pageTranslations.leaderboardTitle || '';
    const tooltipEl = document.querySelector('#leaderboard .tooltip');
    if (tooltipEl) tooltipEl.textContent = pageTranslations.leaderboardTooltip || '';
    const disclaimerEl = document.querySelector('.discord-disclaimer');
    if (disclaimerEl) disclaimerEl.textContent = pageTranslations.discordDisclaimer || '';
  } else if (pageKey === 'store') {
    const shopTitle = document.getElementById('shopTitle');
    if (shopTitle) shopTitle.textContent = pageTranslations.shopTitle;
    const filterTitle = document.getElementById('filterTitle');
    if (filterTitle) filterTitle.textContent = pageTranslations.filterTitle;
    const catAll = document.getElementById('catAll');
    if (catAll) catAll.textContent = pageTranslations.catAll;
    const catFemale = document.getElementById('catFemale');
    if (catFemale) catFemale.textContent = pageTranslations.catFemale;
    const catFemboy = document.getElementById('catFemboy');
    if (catFemboy) catFemboy.textContent = pageTranslations.catFemboy;
    const catCollections = document.getElementById('catCollections');
    if (catCollections) catCollections.textContent = pageTranslations.catCollections;
    const sortTitle = document.getElementById('sortTitle');
    if (sortTitle) sortTitle.textContent = pageTranslations.sortTitle;
    const sortNewest = document.getElementById('sortNewest');
    if (sortNewest) sortNewest.textContent = pageTranslations.sortNewest;
    const sortOldest = document.getElementById('sortOldest');
    if (sortOldest) sortOldest.textContent = pageTranslations.sortOldest;
    const sortLow = document.getElementById('sortLow');
    if (sortLow) sortLow.textContent = pageTranslations.sortLow;
    const sortHigh = document.getElementById('sortHigh');
    if (sortHigh) sortHigh.textContent = pageTranslations.sortHigh;
    const productsTitle = document.getElementById('productsTitle');
    if (productsTitle) productsTitle.textContent = pageTranslations.productsTitle;
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = pageTranslations.searchPlaceholder;
  }
}

// Expose globally
window.translations = translations;
window.syncLanguage = syncLanguage;
window.setLanguage = setLanguage;
window.applyTranslations = applyTranslations;
window.currentLanguage = currentLanguage;
