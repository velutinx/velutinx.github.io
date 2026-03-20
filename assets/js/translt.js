// translations.js – now at assets/js/translt.js
const SUPPORTED_LANGUAGES = ['en', 'ja', 'zh', 'es'];
const DEFAULT_LANG = 'en';

const translations = {
  artwork: {
    en: { artworkIntro: "Hello! These are just a few small samples of my artwork — I share a lot more on my free Discord! — Temporal Images" },
    ja: { artworkIntro: "こんにちは！こちらは作品サンプルの一部です。無料Discordではさらに多く公開しています！ — Temporal Images" },
    zh: { artworkIntro: "你好！这些只是我作品的一小部分样本——我在免费Discord上分享更多！ — Temporal Images" },
    es: { artworkIntro: "¡Hola! Estas son solo algunas pequeñas muestras de mi arte — ¡comparto mucho más en mi Discord gratuito! — Temporal Images" }
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
      menuCommissions: "依頼",
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

function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.includes(lang)) lang = DEFAULT_LANG;
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

  if (pageKey === 'artwork') {
    const introEl = document.getElementById('artworkIntro');
    if (introEl && pageTranslations.artworkIntro) {
      introEl.textContent = pageTranslations.artworkIntro;
    }
  } else if (pageKey === 'commissions') {
    const titleEl = document.getElementById('comTitle');
    if (titleEl) titleEl.textContent = pageTranslations.comTitle || '';
    const infoEl = document.getElementById('comInfo');
    if (infoEl) infoEl.textContent = pageTranslations.comInfo || '';
    const listEl = document.getElementById('comList');
    if (listEl) listEl.innerHTML = pageTranslations.comList?.trim() || '';
  }
  // other pages can be added later
}

// Expose globally
window.translations = translations;
window.setLanguage = setLanguage;
window.applyTranslations = applyTranslations;
window.currentLanguage = currentLanguage;
