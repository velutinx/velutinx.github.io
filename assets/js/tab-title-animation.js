// assets/js/tab-title-animation.js
const titles = [
  "VELUTINX",
  "ELUTINX",
  "LUTINX",
  "UTINX",
  "TINX",
  "INX",
  "NX",
  "X"
];

let index = 0;

function animateTitle() {
  document.title = titles[index];
  index = (index + 1) % titles.length;   // Simple loop back to start
  setTimeout(animateTitle, 400);         // Adjust timing: 600ms = nice pace
}

// Start when page loads
animateTitle();
