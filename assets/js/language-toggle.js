// language-toggle.js

let isJapanese = false;
let blobTexts = []; // will be filled later
let heroSub = null;

const langToggle = document.getElementById("langToggle");
const langSwipe = document.getElementById("langSwipe");

export function initLanguageToggle() {
  // Cache elements once nav is loaded
  blobTexts = document.querySelectorAll(".blob-text");
  heroSub = document.getElementById("heroSub");

  langToggle.onclick = () => {
    langSwipe.classList.remove("active");
    void langSwipe.offsetWidth; // force reflow
    langSwipe.classList.add("active");

    setTimeout(() => {
      isJapanese = !isJapanese;

      blobTexts.forEach(t => {
        t.textContent = isJapanese ? t.dataset.jp : t.dataset.en;
      });

      if (heroSub) {
        heroSub.textContent = isJapanese
          ? "♡ フリーランスイラストレーター ♡"
          : "♡ Freelance Illustrator ♡";
      }

      langToggle.textContent = isJapanese ? "EN" : "日本語";
    }, 180);
  };
}
