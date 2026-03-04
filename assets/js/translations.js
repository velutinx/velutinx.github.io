// /assets/js/translations.js

const SUPPORTED_LANGUAGES = ['en', 'ja', 'zh', 'es'];
const DEFAULT_LANG = 'en';

// Translations by page
const translations = {
  commissions: {
    en: {
      comTitle: "COMMISSIONS",
      comInfo: "Commission information will be added here soon.",
      comList: `
        ✦ Prices<br>
        ✦ Examples<br>
        ✦ Terms of Service<br>
        ✦ Queue Status<br><br>
        (Placeholder content — coming soon ♡)
      `
    },
    ja: {
      comTitle: "コミッション",
      comInfo: "コミッション情報は近日中に追加されます。",
      comList: `
        ✦ 料金<br>
        ✦ サンプル<br>
        ✦ 利用規約<br>
        ✦ 受付状況<br><br>
        （プレースホルダー — 近日公開 ♡）
      `
    },
    zh: {
      comTitle: "委托",
      comInfo: "委托信息即将添加在此。",
      comList: `
        ✦ 价格<br>
        ✦ 示例<br>
        ✦ 服务条款<br>
        ✦ 队列状态<br><br>
        （占位内容 — 即将推出 ♡）
      `
    },
    es: {
      comTitle: "COMISIONES",
      comInfo: "La información de comisiones se agregará aquí pronto.",
      comList: `
        ✦ Precios<br>
        ✦ Ejemplos<br>
        ✦ Términos de Servicio<br>
        ✦ Estado de la Cola<br><br>
        (Contenido provisional — próximamente ♡)
      `
    }
  },

  artwork: {
    en: {
      artworkIntro: "Hello! These are just a few small samples of my artwork — I share a lot more on my free Discord! — Temporal Images"
    },
    ja: {
      artworkIntro: "こんにちは！こちらは作品サンプルの一部です。無料Discordではさらに多く公開しています！ — Temporal Images"
    },
    zh: {
      artworkIntro: "你好！这些只是我作品的一小部分样本——我在免费Discord上分享更多！ — Temporal Images"
    },
    es: {
      artworkIntro: "¡Hola! Estas son solo algunas pequeñas muestras de mi arte — ¡comparto mucho más en mi Discord gratuito! — Temporal Images"
    }
  }
};

let currentLanguage = localStorage.getItem('language') || DEFAULT_LANG;

function applyTranslations(pageKey = 'commissions') {
  const pageTranslations = translations[pageKey]?.[currentLanguage] || translations[pageKey]?.[DEFAULT_LANG];

  if (!pageTranslations) {
    console.warn(`No translations for page: ${pageKey} / lang: ${currentLanguage}`);
    return;
  }

  if (pageKey === 'commissions') {
    const titleEl = document.getElementById('comTitle');
    if (titleEl) titleEl.textContent = pageTranslations.comTitle;

    const infoEl = document.getElementById('comInfo');
    if (infoEl) infoEl.textContent = pageTranslations.comInfo;

    const listEl = document.getElementById('comList');
    if (listEl) listEl.innerHTML = pageTranslations.comList.trim();
  } 
  else if (pageKey === 'artwork') {
    const introEl = document.getElementById('artworkIntro');
    if (introEl) introEl.textContent = pageTranslations.artworkIntro;
  }
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.includes(lang)) lang = DEFAULT_LANG;

  currentLanguage = lang;
  localStorage.setItem('language', lang);

  // Swipe animation
  const swipe = document.getElementById('langSwipe');
  if (swipe) {
    swipe.classList.remove('active');
    void swipe.offsetHeight;
    swipe.classList.add('active');
  }

  // Re-apply translations (pageKey must be passed from page script)
  // We dispatch event so pages can re-apply with correct key
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations(); // default to commissions — pages should call with their key
});
