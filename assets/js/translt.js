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

  if (pageKey === 'index') {
    const heroSubEl = document.getElementById('heroSub');
    if (heroSubEl && pageTranslations.heroSub) {
      heroSubEl.textContent = pageTranslations.heroSub;
    }
    // The second hero-sub (with flags) is left static
  } else if (pageKey === 'artwork') {
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
  }
}

// Expose globally
window.translations = translations;
window.setLanguage = setLanguage;
window.applyTranslations = applyTranslations;
window.currentLanguage = currentLanguage;
