/* ===============================
   CANVAS SETUP
=============================== */

const canvas = document.createElement("canvas");
canvas.id = "cursorCanvas";

/* fullscreen overlay */
canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.width = "100vw";
canvas.style.height = "100vh";
canvas.style.pointerEvents = "none";
canvas.style.zIndex = "999999";

document.body.appendChild(canvas);

/* force hide system cursor */
document.documentElement.style.cursor = "none";
document.body.style.cursor = "none";
canvas.style.cursor = "none";

const ctx = canvas.getContext("2d");

/* ===============================
   CANVAS SIZE
=============================== */

let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

function resizeCanvas(){
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();


let hue=0;

function pastel(a=1){
  return `hsla(${hue},65%,78%,${a})`;
}

let mouse={x:w/2,y:h/2};
let comet={x:w/2,y:h/2};

window.addEventListener("mousemove",e=>{
  mouse.x=e.clientX;
  mouse.y=e.clientY;
});

let trail=[];
let particles=[];
let clickEffects=[];
let clickTriangles=[];

/* ===============================
   CURSOR TRIANGLES
================================ */

class Triangle{

  constructor(x,y){

    this.x = x;
    this.y = y;

    /* same velocity range, allows all directions */
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;

    this.size = Math.random() * 3 + 2;
    this.life = 80;
    this.rot = Math.random() * Math.PI;

  }

  update(){

    /* 50% slower movement */
    this.x += this.vx * 0.5;
    this.y += this.vy * 0.5;

    this.rot += 0.04;

    this.life--;

  }

  draw(){

    ctx.save();

    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);

    let a = this.life / 80;

    ctx.fillStyle = pastel(a);

    ctx.beginPath();
    ctx.moveTo(0, -this.size);
    ctx.lineTo(this.size, this.size);
    ctx.lineTo(-this.size, this.size);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

  }

}

function spawnTriangle(x,y){

  if(Math.random() < 0.07){
    particles.push(new Triangle(x,y));
  }

}

/* ===============================
   CLICK ORBIT
================================ */

class ClickOrbit{

  constructor(x,y){
    this.x=x;
    this.y=y;
    this.angle=0;
    this.radius=20;
    this.life=55;
    this.trail=[];
  }

  update(){

    this.angle -= 0.11;
    this.life--;

    let px=this.x+Math.cos(this.angle)*this.radius;
    let py=this.y+Math.sin(this.angle)*this.radius;

    this.trail.push({x:px,y:py});
    if(this.trail.length>12) this.trail.shift();

    if(this.life===40) spawnClickTriangle(this.x,this.y);
    if(this.life===34) spawnClickTriangle(this.x,this.y);
    if(this.life===28) spawnClickTriangle(this.x,this.y);
    if(this.life===22) spawnClickTriangle(this.x,this.y);

  }

  draw(){

    ctx.lineCap="round";

    for(let i=0;i<this.trail.length-1;i++){

      let p1=this.trail[i];
      let p2=this.trail[i+1];
      let t=i/this.trail.length;

      ctx.strokeStyle=pastel(0.45*(1-t));
      ctx.lineWidth=2+6*t;

      ctx.beginPath();
      ctx.moveTo(p1.x,p1.y);
      ctx.lineTo(p2.x,p2.y);
      ctx.stroke();

    }

    let px=this.x+Math.cos(this.angle)*this.radius;
    let py=this.y+Math.sin(this.angle)*this.radius;

    let g=ctx.createRadialGradient(px,py,0,px,py,6);

    g.addColorStop(0,"rgba(255,255,255,0.9)");
    g.addColorStop(0.5,`hsl(${hue},65%,78%)`);
    g.addColorStop(1,"rgba(0,0,0,0)");

    ctx.fillStyle=g;

    ctx.beginPath();
    ctx.arc(px,py,6,0,Math.PI*2);
    ctx.fill();

  }

}

/* ===============================
   CLICK TRIANGLES
================================ */

class ClickTriangle{

  constructor(x,y){

    let offsetAngle=Math.random()*Math.PI*2;
    let offsetDist=Math.random()*6;

    this.x=x+Math.cos(offsetAngle)*offsetDist;
    this.y=y+Math.sin(offsetAngle)*offsetDist;

    let speed=2.8 + Math.random()*1.6;
    let dir=Math.random()*Math.PI*2;

    this.vx=Math.cos(dir)*speed;
    this.vy=Math.sin(dir)*speed;

    this.drag=0.96;

    this.size=4+Math.random()*1.5;

    this.life=65;

    this.rot=Math.random()*Math.PI;
    this.spin=(Math.random()-0.5)*0.08;

  }

  update(){

    this.vx*=this.drag;
    this.vy*=this.drag;

    this.x+=this.vx;
    this.y+=this.vy;

    this.rot+=this.spin;

    this.life--;

  }

  draw(){

    ctx.save();

    ctx.translate(this.x,this.y);
    ctx.rotate(this.rot);

    let a=this.life/65;

    ctx.fillStyle=pastel(a);

    ctx.beginPath();
    ctx.moveTo(0,-this.size);
    ctx.lineTo(this.size,this.size);
    ctx.lineTo(-this.size,this.size);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

  }

}

function spawnClickTriangle(x,y){
  clickTriangles.push(new ClickTriangle(x,y));
}

window.addEventListener("click",e=>{
  clickEffects.push(new ClickOrbit(e.clientX,e.clientY));
});

/* ===============================
   CURSOR DRAWING
================================ */

function drawTrail(){

  ctx.lineCap="round";

  for(let i=0;i<trail.length-1;i++){

    let p1=trail[i];
    let p2=trail[i+1];

    let t=i/trail.length;

    ctx.strokeStyle=pastel(0.5*(1-t));
    ctx.lineWidth=2 + 8*t;

    ctx.beginPath();
    ctx.moveTo(p1.x,p1.y);
    ctx.lineTo(p2.x,p2.y);
    ctx.stroke();

  }

}

function drawHead(){

  let g=ctx.createRadialGradient(
    comet.x,comet.y,0,
    comet.x,comet.y,7
  );

  g.addColorStop(0,"rgba(255,255,255,0.95)");
  g.addColorStop(0.5,`hsl(${hue},65%,78%)`);
  g.addColorStop(1,"rgba(0,0,0,0)");

  ctx.fillStyle=g;

  ctx.beginPath();
  ctx.arc(comet.x,comet.y,7,0,Math.PI*2);
  ctx.fill();

}

/* ===============================
   LOOP
================================ */

function loop(){

  hue = (hue + 0.6) % 360;
ctx.clearRect(0,0,w,h);

  comet.x += (mouse.x-comet.x)*0.2;
  comet.y += (mouse.y-comet.y)*0.2;

  trail.push({x:comet.x,y:comet.y});

  if(trail.length>22){
    trail.shift();
  }

  spawnTriangle(comet.x,comet.y);

  drawTrail();
  drawHead();

  for(let i=particles.length-1;i>=0;i--){

    let p=particles[i];

    p.update();
    p.draw();

    if(p.life<=0){
      particles.splice(i,1);
    }

  }

  for(let i=clickEffects.length-1;i>=0;i--){

    let c=clickEffects[i];

    c.update();
    c.draw();

    if(c.life<=0){
      clickEffects.splice(i,1);
    }

  }

  for(let i=clickTriangles.length-1;i>=0;i--){

    let t=clickTriangles[i];

    t.update();
    t.draw();

    if(t.life<=0){
      clickTriangles.splice(i,1);
    }

  }

  requestAnimationFrame(loop);

}

loop();
