// /assets/js/translations.js

// Available languages (you can add more later)
const SUPPORTED_LANGUAGES = ['en', 'ja'];

// Default fallback
const DEFAULT_LANG = 'en';

// All translatable texts – organized by page or section
const translations = {
  // Shared / global (e.g. nav blobs can be handled separately if needed)
  shared: {
    // Example: if you later have global elements
  },

  // Commissions page
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
    }
  },

  // Add more pages later, e.g.:
  // contact: { en: { ... }, ja: { ... } },
  // about: { en: { ... }, ja: { ... } }
};

// Current language (will be set from localStorage or default)
let currentLanguage = localStorage.getItem('language') || DEFAULT_LANG;

// Main function to update text on the page
function applyTranslations(pageKey = 'commissions') {
  const pageTranslations = translations[pageKey]?.[currentLanguage] || translations[pageKey]?.[DEFAULT_LANG];

  if (!pageTranslations) {
    console.warn(`No translations found for page: ${pageKey} / lang: ${currentLanguage}`);
    return;
  }

  // Update commissions page elements (add more selectors as you add pages)
  const titleEl = document.getElementById('comTitle');
  if (titleEl) titleEl.textContent = pageTranslations.comTitle;

  const infoEl = document.getElementById('comInfo');
  if (infoEl) infoEl.textContent = pageTranslations.comInfo;

  const listEl = document.getElementById('comList');
  if (listEl) listEl.innerHTML = pageTranslations.comList;

  // Example for future pages:
  // if (pageKey === 'contact') {
  //   document.getElementById('contactTitle').textContent = pageTranslations.contactTitle;
  //   ...
  // }
}

// Change language + trigger swipe + update UI
function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    lang = DEFAULT_LANG;
  }

  currentLanguage = lang;
  localStorage.setItem('language', lang);

  // Trigger swipe animation
  const swipe = document.getElementById('langSwipe');
  if (swipe) {
    swipe.classList.remove('active');
    void swipe.offsetHeight; // reflow
    swipe.classList.add('active');
  }

  // Apply translations
  applyTranslations(); // default = 'commissions' – change when on other pages

  // Optional: dispatch event so other scripts can react
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
});
