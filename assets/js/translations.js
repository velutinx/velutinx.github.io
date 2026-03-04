// /assets/js/translations.js

// Available languages
const SUPPORTED_LANGUAGES = ['en', 'ja', 'zh', 'es'];

// Default fallback
const DEFAULT_LANG = 'en';

// All translatable texts – organized by page
const translations = {
  index: {
    en: { heroSub: "♡ Freelance Illustrator ♡", heroSubExtra: "🇺🇸 / 🇯🇵 / 🇪🇸 = OK!" },
    ja: { heroSub: "♡ フリーランスイラストレーター ♡", heroSubExtra: "🇺🇸 / 🇯🇵 / 🇪🇸 = OK!" },
    zh: { heroSub: "♡ 自由插画师 ♡", heroSubExtra: "🇺🇸 / 🇯🇵 / 🇪🇸 = 可以！" },
    es: { heroSub: "♡ Ilustradora Freelance ♡", heroSubExtra: "🇺🇸 / 🇯🇵 / 🇪🇸 = ¡OK!" }
  },

  commissions: {
    en: {
      comTitle: "COMMISSIONS",
      comInfo: "Commission information will be added here soon.",
      comList: `✦ Prices<br>✦ Examples<br>✦ Terms of Service<br>✦ Queue Status<br><br>(Placeholder content — coming soon ♡)`
    },
    ja: {
      comTitle: "コミッション",
      comInfo: "コミッション情報は近日中に追加されます。",
      comList: `✦ 料金<br>✦ サンプル<br>✦ 利用規約<br>✦ 受付状況<br><br>（プレースホルダー — 近日公開 ♡）`
    },
    zh: {
      comTitle: "委托",
      comInfo: "委托信息即将添加在此。",
      comList: `✦ 价格<br>✦ 示例<br>✦ 服务条款<br>✦ 队列状态<br><br>（占位内容 — 即将推出 ♡）`
    },
    es: {
      comTitle: "COMISIONES",
      comInfo: "La información de comisiones se agregará aquí pronto.",
      comList: `✦ Precios<br>✦ Ejemplos<br>✦ Términos de Servicio<br>✦ Estado de la Cola<br><br>(Contenido provisional — próximamente ♡)`
    }
  },

  artwork: {
    en: { artworkIntro: "Hello! These are just a few small samples of my artwork — I share a lot more on my free Discord! — Temporal Images" },
    ja: { artworkIntro: "こんにちは！こちらは作品サンプルの一部です。無料Discordではさらに多く公開しています！ — Temporal Images" },
    zh: { artworkIntro: "你好！这些只是我作品的一小部分样本——我在免费Discord上分享更多！ — Temporal Images" },
    es: { artworkIntro: "¡Hola! Estas son solo algunas pequeñas muestras de mi arte — ¡comparto mucho más en mi Discord gratuito! — Temporal Images" }
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

  // Shop page (Velutinx's Shop)
  shop: {
    en: {
      shopTitle: "Velutinx's Shop",
      filterTitle: "Filter by Category",
      catAll: "All",
      catNot: "Not On Booth",
      catFrom: "From Booth",
      catSisters: "The Sisters Corner",
      sortTitle: "Sort by",
      sortDefault: "Default",
      sortNewest: "Newest",
      sortLow: "Price: Low to High",
      sortHigh: "Price: High to Low",
      resetBtn: "Reset Filters",
      productsTitle: "Products",
      searchPlaceholder: "Search",
      cartTitle: "Shopping Cart",
      totalLabel: "Total",
      snackText: "Added successfully",
      loginBtn: "Login"
    },
    ja: {
      shopTitle: "Velutinxのショップ",
      filterTitle: "カテゴリでフィルター",
      catAll: "すべて",
      catNot: "Boothにない",
      catFrom: "Boothから",
      catSisters: "姉妹のコーナー",
      sortTitle: "並び替え",
      sortDefault: "デフォルト",
      sortNewest: "最新",
      sortLow: "価格: 低い → 高い",
      sortHigh: "価格: 高い → 低い",
      resetBtn: "フィルターをリセット",
      productsTitle: "商品",
      searchPlaceholder: "検索",
      cartTitle: "ショッピングカート",
      totalLabel: "合計",
      snackText: "カートに追加しました",
      loginBtn: "ログイン"
    },
    zh: {
      shopTitle: "Velutinx的商店",
      filterTitle: "按类别筛选",
      catAll: "全部",
      catNot: "不在Booth上",
      catFrom: "来自Booth",
      catSisters: "姐妹角落",
      sortTitle: "排序方式",
      sortDefault: "默认",
      sortNewest: "最新",
      sortLow: "价格: 低到高",
      sortHigh: "价格: 高到低",
      resetBtn: "重置筛选",
      productsTitle: "商品",
      searchPlaceholder: "搜索",
      cartTitle: "购物车",
      totalLabel: "总计",
      snackText: "已成功添加到购物车",
      loginBtn: "登录"
    },
    es: {
      shopTitle: "Tienda de Velutinx",
      filterTitle: "Filtrar por Categoría",
      catAll: "Todo",
      catNot: "No en Booth",
      catFrom: "De Booth",
      catSisters: "La Esquina de las Hermanas",
      sortTitle: "Ordenar por",
      sortDefault: "Predeterminado",
      sortNewest: "Más reciente",
      sortLow: "Precio: Bajo a Alto",
      sortHigh: "Precio: Alto a Bajo",
      resetBtn: "Restablecer filtros",
      productsTitle: "Productos",
      searchPlaceholder: "Buscar",
      cartTitle: "Carrito de compras",
      totalLabel: "Total",
      snackText: "Agregado correctamente",
      loginBtn: "Iniciar sesión"
    }
  },

  // Poll page (for completeness)
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
  }
};

let currentLanguage = localStorage.getItem('language') || DEFAULT_LANG;

function applyTranslations(pageKey = 'index') {
  const pageTranslations = translations[pageKey]?.[currentLanguage] || translations[pageKey]?.[DEFAULT_LANG];
  if (!pageTranslations) {
    console.warn(`No translations found for page: ${pageKey} / lang: ${currentLanguage}`);
    return;
  }

  // Index
  if (pageKey === 'index') {
    const heroSubEl = document.getElementById('heroSub');
    if (heroSubEl) heroSubEl.textContent = pageTranslations.heroSub;
  }

  // Commissions
  if (pageKey === 'commissions') {
    const titleEl = document.getElementById('comTitle');
    if (titleEl) titleEl.textContent = pageTranslations.comTitle;
    const infoEl = document.getElementById('comInfo');
    if (infoEl) infoEl.textContent = pageTranslations.comInfo;
    const listEl = document.getElementById('comList');
    if (listEl) listEl.innerHTML = pageTranslations.comList.trim();
  }

  // Artwork
  if (pageKey === 'artwork') {
    const introEl = document.getElementById('artworkIntro');
    if (introEl) introEl.textContent = pageTranslations.artworkIntro;
  }

  // Contact
  if (pageKey === 'contact') {
    const titleEl = document.getElementById('contactTitle');
    if (titleEl) titleEl.textContent = pageTranslations.contactTitle;
    const descEl = document.getElementById('contactDesc');
    if (descEl) descEl.textContent = pageTranslations.contactDesc;
    const labelName = document.getElementById('labelName');
    if (labelName) labelName.textContent = pageTranslations.labelName;
    const labelEmail = document.getElementById('labelEmail');
    if (labelEmail) labelEmail.textContent = pageTranslations.labelEmail;
    const labelMessage = document.getElementById('labelMessage');
    if (labelMessage) labelMessage.textContent = pageTranslations.labelMessage;
    const nameInput = document.getElementById('name');
    if (nameInput) nameInput.placeholder = pageTranslations.namePlaceholder;
    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.placeholder = pageTranslations.emailPlaceholder;
    const messageInput = document.getElementById('message');
    if (messageInput) messageInput.placeholder = pageTranslations.messagePlaceholder;
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) sendBtn.textContent = pageTranslations.sendBtn;
  }

  // Shop
  if (pageKey === 'shop') {
    const shopTitleEl = document.getElementById('shopTitle');
    if (shopTitleEl) shopTitleEl.textContent = pageTranslations.shopTitle;

    const filterTitleEl = document.getElementById('filterTitle');
    if (filterTitleEl) filterTitleEl.textContent = pageTranslations.filterTitle;

    const catAllEl = document.getElementById('catAll');
    if (catAllEl) catAllEl.textContent = pageTranslations.catAll;
    const catNotEl = document.getElementById('catNot');
    if (catNotEl) catNotEl.textContent = pageTranslations.catNot;
    const catFromEl = document.getElementById('catFrom');
    if (catFromEl) catFromEl.textContent = pageTranslations.catFrom;
    const catSistersEl = document.getElementById('catSisters');
    if (catSistersEl) catSistersEl.textContent = pageTranslations.catSisters;

    const sortTitleEl = document.getElementById('sortTitle');
    if (sortTitleEl) sortTitleEl.textContent = pageTranslations.sortTitle;
    const sortDefaultEl = document.getElementById('sortDefault');
    if (sortDefaultEl) sortDefaultEl.textContent = pageTranslations.sortDefault;
    const sortNewestEl = document.getElementById('sortNewest');
    if (sortNewestEl) sortNewestEl.textContent = pageTranslations.sortNewest;
    const sortLowEl = document.getElementById('sortLow');
    if (sortLowEl) sortLowEl.textContent = pageTranslations.sortLow;
    const sortHighEl = document.getElementById('sortHigh');
    if (sortHighEl) sortHighEl.textContent = pageTranslations.sortHigh;

    const resetBtnEl = document.getElementById('resetBtn');
    if (resetBtnEl) resetBtnEl.textContent = pageTranslations.resetBtn;

    const productsTitleEl = document.getElementById('productsTitle');
    if (productsTitleEl) productsTitleEl.textContent = pageTranslations.productsTitle;

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = pageTranslations.searchPlaceholder;

    const cartTitleEl = document.getElementById('cartTitle');
    if (cartTitleEl) cartTitleEl.textContent = pageTranslations.cartTitle;

    const totalLabelEl = document.getElementById('totalLabel');
    if (totalLabelEl) totalLabelEl.textContent = pageTranslations.totalLabel;

    const snackTextEl = document.getElementById('snackText');
    if (snackTextEl) snackTextEl.textContent = pageTranslations.snackText;

    const loginBtnEl = document.getElementById('loginBtn');
    if (loginBtnEl) loginBtnEl.textContent = pageTranslations.loginBtn;
  }

  // Poll
  if (pageKey === 'poll') {
    const titleEl = document.querySelector('.poll-title');
    if (titleEl) titleEl.textContent = pageTranslations.pollTitle;

    const subtitleEl = document.querySelector('.poll-subtitle');
    if (subtitleEl) subtitleEl.textContent = pageTranslations.pollSubtitle;

    const leaderboardTitleEl = document.querySelector('#leaderboard h3');
    if (leaderboardTitleEl) leaderboardTitleEl.textContent = pageTranslations.leaderboardTitle;

    const tooltipEl = document.querySelector('#leaderboard .tooltip');
    if (tooltipEl) tooltipEl.textContent = pageTranslations.leaderboardTooltip;

    const disclaimerEl = document.querySelector('.discord-disclaimer');
    if (disclaimerEl) disclaimerEl.textContent = pageTranslations.discordDisclaimer;
  }
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.includes(lang)) lang = DEFAULT_LANG;

  currentLanguage = lang;
  localStorage.setItem('language', lang);

  const swipe = document.getElementById('langSwipe');
  if (swipe) {
    swipe.classList.remove('active');
    void swipe.offsetHeight;
    swipe.classList.add('active');
  }

  document.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Pages will call applyTranslations('their-key')
});
