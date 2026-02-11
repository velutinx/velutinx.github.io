const heroImage = document.getElementById("heroImage");
setInterval(() => {
  const star = document.createElement("div");
  star.className = "social-star";
  star.textContent = "✦";
  star.style.left = Math.random() * heroImage.clientWidth + "px";
  star.style.top = "0px";
  heroImage.appendChild(star);
  setTimeout(() => star.remove(), 6000);
}, 700);
