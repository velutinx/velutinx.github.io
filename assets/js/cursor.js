document.addEventListener("DOMContentLoaded", () => {

// ===============================
// CANVAS SETUP
// ===============================

const canvas = document.getElementById("cursorCanvas");
if(!canvas) return;

const ctx = canvas.getContext("2d");

let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

ctx.imageSmoothingEnabled = false;

window.addEventListener("resize", () => {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
});

// ===============================
// MOUSE
// ===============================

let mouseX = w/2;
let mouseY = h/2;

document.addEventListener("mousemove", e=>{
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// ===============================
// TRAIL
// ===============================

const trail = [];
const TRAIL_LENGTH = 14;

function updateTrail(){

  trail.push({x:mouseX, y:mouseY});

  if(trail.length > TRAIL_LENGTH){
    trail.shift();
  }

}

function drawTrail(){

  for(let i=0;i<trail.length-1;i++){

    const p1 = trail[i];
    const p2 = trail[i+1];

    ctx.beginPath();
    ctx.moveTo(p1.x,p1.y);
    ctx.lineTo(p2.x,p2.y);

    ctx.strokeStyle = `rgba(255,180,220,${i/TRAIL_LENGTH})`;
    ctx.lineWidth = 2;

    ctx.stroke();

  }

}

// ===============================
// TRIANGLES
// ===============================

const particles = [];
const MAX_PARTICLES = 80;

class Triangle{

  constructor(x,y){

    this.x = x;
    this.y = y;

    this.size = Math.random()*6+4;

    this.life = 1;

    this.rot = Math.random()*Math.PI;

    this.vx = (Math.random()-0.5)*2;
    this.vy = (Math.random()-0.5)*2;

    this.color = pastel();

  }

  update(){

    this.x += this.vx;
    this.y += this.vy;

    this.rot += 0.02;

    this.life -= 0.015;

  }

  draw(){

    ctx.save();

    ctx.translate(this.x,this.y);
    ctx.rotate(this.rot);

    ctx.globalAlpha = this.life;

    ctx.fillStyle = this.color;

    ctx.beginPath();
    ctx.moveTo(0,-this.size);
    ctx.lineTo(this.size,this.size);
    ctx.lineTo(-this.size,this.size);
    ctx.fill();

    ctx.restore();

  }

}

// ===============================
// COLOR
// ===============================

function pastel(){

  const colors = [
    "#ffd6f6",
    "#ffe8b6",
    "#d8f6ff",
    "#e9d8ff",
    "#caffbf"
  ];

  return colors[Math.floor(Math.random()*colors.length)];

}

// ===============================
// PARTICLE SPAWN
// ===============================

function spawnTriangle(x,y){

  if(particles.length > MAX_PARTICLES) return;

  if(Math.random() < 0.035){
    particles.push(new Triangle(x,y));
  }

}

function updateParticles(){

  for(let i=particles.length-1;i>=0;i--){

    const p = particles[i];

    p.update();

    if(p.life <= 0){
      particles.splice(i,1);
    }

  }

}

function drawParticles(){

  for(let p of particles){
    p.draw();
  }

}

// ===============================
// FRAME LIMITER
// ===============================

let lastFrame = 0;
const FRAME_INTERVAL = 1000/60;

// ===============================
// MAIN LOOP
// ===============================

function loop(time){

  if(time - lastFrame < FRAME_INTERVAL){
    requestAnimationFrame(loop);
    return;
  }

  lastFrame = time;

  ctx.clearRect(0,0,w,h);

  updateTrail();
  drawTrail();

  spawnTriangle(mouseX,mouseY);

  updateParticles();
  drawParticles();

  requestAnimationFrame(loop);

}

requestAnimationFrame(loop);

});
