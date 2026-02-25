(function(){

/* ================= INTRO OVERLAY ================= */

const overlay = document.createElement("div");
overlay.id = "intro-overlay";

overlay.innerHTML = `
<style>

#intro-overlay{
  position:fixed;
  inset:0;
  background:black;
  z-index:99999;
  display:flex;
  justify-content:center;
  align-items:center;
  overflow:hidden;
}

/* Loading text */

#intro-percent{
  color:#E6D5B8;
  font-size:48px;
  font-family: 'Trajan Pro Bold', serif;
  letter-spacing:2px;
}

/* Flash */

.flash{
  animation:flashAnim 0.18s ease-in-out 3;
}

@keyframes flashAnim{
  0%{opacity:1;}
  50%{opacity:0;}
  100%{opacity:1;}
}

/* Sweep reveal */

.sweep-reveal{
  position:absolute;
  top:0;
  right:0;
  height:100%;
  width:0%;
  background:transparent;
}

.sweep-line{
  position:absolute;
  top:0;
  right:0;
  width:10px;
  height:100%;
  background:#aa9e76;
  box-shadow:0 0 30px #aa9e76;
}

@keyframes sweepMove{
  from{ right:0; }
  to{ right:100%; }
}

@keyframes sweepReveal{
  from{ width:0%; }
  to{ width:100%; }
}

</style>

<div id="intro-percent">0%</div>
<div class="sweep-reveal" id="sweepReveal"></div>
<div class="sweep-line" id="sweepLine"></div>
`;

document.body.appendChild(overlay);

/* ================= LOADING COUNT ================= */

function startLoading(){

  const duration = 1300;
  const percentEl = document.getElementById("intro-percent");
  let start = null;

  function animate(timestamp){
    if(!start) start = timestamp;
    let progress = timestamp - start;
    let percent = Math.min(Math.floor((progress/duration)*100),100);
    percentEl.textContent = percent + "%";

    if(progress < duration){
      requestAnimationFrame(animate);
    } else {
      percentEl.classList.add("flash");
      setTimeout(startSweep, 540);
    }
  }

  requestAnimationFrame(animate);
}

/* ================= FINAL SWEEP ================= */

function startSweep(){

  const line = document.getElementById("sweepLine");
  const reveal = document.getElementById("sweepReveal");

  // Hide percent text
  document.getElementById("intro-percent").style.opacity = "0";

  line.style.animation = "sweepMove 0.3s linear forwards";
  reveal.style.animation = "sweepReveal 0.3s linear forwards";

  // Remove overlay after sweep completes
  setTimeout(()=>{
    overlay.remove();
  }, 320);
}

startLoading();

})();
