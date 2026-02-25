(function(){

/* ================= CONFIG ================= */
const REDIRECT_URL = "main.html"; // ← change to your real page

/* ================= BUILD HTML ================= */
const wrapper = document.createElement("div");
wrapper.innerHTML = `
<div id="intro-root">

<style>

#intro-root{
  position:fixed;
  inset:0;
  z-index:9999;
  font-family:serif;
}

/* ============ FINAL SWEEP ============ */

.final-sweep{
  position:fixed;
  inset:0;
  background:black;
  opacity:0;
  pointer-events:none;
}

.final-sweep.active{ opacity:1; }

.sweep-reveal{
  position:absolute;
  top:0;
  right:0;
  height:100%;
  width:0%;
  background:white;
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

.loading-screen{
  position:fixed;
  inset:0;
  background:black;
  display:flex;
  justify-content:center;
  align-items:center;
  color:#E6D5B8;
  font-size:48px;
}

.flash{
  animation:flashAnim 0.18s ease-in-out 3;
}

@keyframes flashAnim{
  0%{ opacity:1; }
  50%{ opacity:0; }
  100%{ opacity:1; }
}

</style>

<div class="loading-screen">
  <div id="percent">0%</div>
</div>

<div class="final-sweep" id="finalSweep">
  <div class="sweep-reveal" id="sweepReveal"></div>
  <div class="sweep-line" id="sweepLine"></div>
</div>

</div>
`;

document.body.appendChild(wrapper);

/* ================= LOADING LOGIC ================= */

function startIntro(){

  const duration = 1300;
  const percentEl = document.getElementById("percent");
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
      setTimeout(startFinalSweep, 540);
    }
  }

  requestAnimationFrame(animate);
}

function startFinalSweep(){
  const sweep = document.getElementById("finalSweep");
  const line = document.getElementById("sweepLine");
  const reveal = document.getElementById("sweepReveal");

  sweep.classList.add("active");
  line.style.animation = "sweepMove 0.3s linear forwards";
  reveal.style.animation = "sweepReveal 0.3s linear forwards";

  setTimeout(()=>{
    window.location.href = REDIRECT_URL;
  }, 320);
}

startIntro();

})();
