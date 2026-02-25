document.addEventListener("DOMContentLoaded", function () {

  const mainWebsite = document.getElementById("mainWebsite");
  if (!mainWebsite) return;

  mainWebsite.style.opacity = "0";

  const isManualIndex = window.location.href.endsWith("/index.html");

  // Duration settings
  const duration = isManualIndex ? 300 : 1200; 
  // shorter animation when manually visiting index.html

  const intro = document.createElement("div");
  intro.style.position = "fixed";
  intro.style.top = "0";
  intro.style.left = "0";
  intro.style.width = "100vw";
  intro.style.height = "100vh";
  intro.style.background = "black";
  intro.style.zIndex = "9999";
  intro.style.overflow = "hidden";

  const line = document.createElement("div");
  line.style.position = "absolute";
  line.style.top = "0";
  line.style.right = "0";
  line.style.width = "4px";
  line.style.height = "100%";
  line.style.background = "#aa9e76";
  line.style.boxShadow = "0 0 12px #aa9e76";
  line.style.transition = `right ${duration}ms linear`;

  intro.appendChild(line);
  document.body.appendChild(intro);

  // Trigger animation
  setTimeout(() => {
    line.style.right = "100%";
  }, 50);

  // Reveal
  setTimeout(() => {
    intro.remove();
    mainWebsite.style.transition = "opacity 0.6s ease";
    mainWebsite.style.opacity = "1";
  }, duration + 100);

});
