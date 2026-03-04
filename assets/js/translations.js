// /assets/js/translations.js

// Available languages
const SUPPORTED_LANGUAGES = ['en', 'ja', 'zh', 'es'];

// Default fallback
const DEFAULT_LANG = 'en';

// All translatable texts – organized by page/section
const translations = {
  // Index / Home page
  index: {
    en: {
      heroSub: "♡ Freelance Illustrator ♡",
      heroSubExtra: "🇺🇸 / 🇯🇵 / 🇪🇸 = OK!"
    },
    ja: {
      heroSub: "♡ フリーランスイラストレーター ♡",
      heroSubExtra: "🇺🇸 / 🇯🇵 / 🇪🇸 = OK!"
    },
    zh: {
      heroSub: "♡ 自由插画师 ♡",
      heroSubExtra: "🇺🇸 / 🇯🇵 / 🇪🇸 = 可以！"
    },
    es: {
      heroSub: "♡ Ilustradora Freelance ♡",
      heroSubExtra: "🇺🇸 / 🇯🇵 / 🇪🇸 = ¡OK!"
    }
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

  // Artwork page
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
  },

  // Contact page
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
  }
};

// Current language
let currentLanguage = localStorage.getItem('language') || DEFAULT_LANG;

// Apply translations based on current page
function applyTranslations(pageKey = 'index') {
  const pageTranslations = translations[pageKey]?.[currentLanguage] || translations[pageKey]?.[DEFAULT_LANG];

  if (!pageTranslations) {
    console.warn(`No translations found for page: ${pageKey} / lang: ${currentLanguage}`);
    return;
  }

  // Index page
  if (pageKey === 'index') {
    const heroSubEl = document.getElementById('heroSub');
    if (heroSubEl) heroSubEl.textContent = pageTranslations.heroSub;
    // If heroSubExtra is in a separate element, add it here
  }

  // Commissions page
  if (pageKey === 'commissions') {
    const titleEl = document.getElementById('comTitle');
    if (titleEl) titleEl.textContent = pageTranslations.comTitle;

    const infoEl = document.getElementById('comInfo');
    if (infoEl) infoEl.textContent = pageTranslations.comInfo;

    const listEl = document.getElementById('comList');
    if (listEl) listEl.innerHTML = pageTranslations.comList.trim();
  }

  // Artwork page
  if (pageKey === 'artwork') {
    const introEl = document.getElementById('artworkIntro');
    if (introEl) introEl.textContent = pageTranslations.artworkIntro;
  }

  // Contact page
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
    void swipe.offsetHeight; // force reflow
    swipe.classList.add('active');
  }

  // Apply translations (page-specific key is passed from each page)
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Each page will call applyTranslations('their-page-key') after loading
});
