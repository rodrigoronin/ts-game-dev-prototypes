const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas?.getContext('2d') as CanvasRenderingContext2D;

// Canvas secundário para a máscara de luz e sombra
const shadowCanvas = document.createElement('canvas');
shadowCanvas.width = canvas.width;
shadowCanvas.height = canvas.height;
const shadowCtx: CanvasRenderingContext2D = shadowCanvas.getContext('2d') as CanvasRenderingContext2D;

console.log(shadowCanvas);

let lightX:number = 200;
let lightY:number = canvas.height / 2;

let player = {
  x: 200,
  y: canvas.height / 2,
  width: 32,
  height: 32,
  speed: 3,
}

let keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};
window.addEventListener('keydown', (e: KeyboardEvent) => {
  keys[e.key] = true;
});
window.addEventListener('keyup', (e: KeyboardEvent) => {
  keys[e.key] = false;
});

function movePlayer() {
  if (keys['w']) player.y -= player.speed;
  if (keys['a']) player.x -= player.speed;
  if (keys['s']) player.y += player.speed;
  if (keys['d']) player.x += player.speed;

  player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
  player.y = Math.max(0, Math.min(player.y, canvas.height - player.height));
}

class Particles {
  x:number;
  y:number;
  vx:number;
  vy:number;
  alpha:number;
  size:number;

  constructor() {
    this.x = Math.random() * canvas.width; // começa em uma posição horizontal aleatória
    this.y = canvas.height; // começa no fundo do canvas
    this.vx = (Math.random() - 0.5) * 0.5; // velocidade horizontal
    this.vy = -Math.random() * 1 -0.5; // velocidade vertical
    this.alpha = 1;
    this.size = Math.random() * 3 + 1; // entre 1 e 4
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 0.02;
  }

  draw() {
    ctx.fillStyle = `rgba(200, 200, 200, ${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

let particles: Particles[] = [];

function createSmoke() {
  // 30% de chance de spawnar partículas por frame
  if (Math.random() < 0.5) {
    particles.push(new Particles());
  }
}

function drawLight(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, 150);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.7)');
  gradient.addColorStop(0.9, 'rgba(255, 255, 255, 0.4)');
  gradient.addColorStop(1,'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(lightX, lightY, 150, 0, Math.PI * 2);
  ctx.fill();
}

function updateAndDrawSmoke() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].alpha <= 0) {
      particles.splice(i, 1); // remove particulas mortas
    }
  }
}

function drawTreeShadow(ctx, x, y) {
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 20, y + 40);
  ctx.lineTo(x + 20, y + 40);
  ctx.closePath();
  ctx.fill();
}

function drawScene() {
  lightX = player.x + player.width / 2;
  lightY = player.y + player.height / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#4a3f2a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'red';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = 'green';
  ctx.fillRect(550, 250, 32, 32);

  createSmoke();
  updateAndDrawSmoke();

  // Desenhar a máscara de luz e sombra no canvas secundário
  shadowCtx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);
  shadowCtx.fillStyle = 'rgba(0, 0, 20, 0.90)';
  shadowCtx.fillRect(0, 0, shadowCanvas.width, shadowCanvas.height);

  shadowCtx.globalCompositeOperation = 'destination-out';
  drawLight(shadowCtx);
  drawTreeShadow(shadowCtx, 100, 500);
  shadowCtx.globalCompositeOperation = 'source-over';

  // Aplicar a máscara de sombra no canvas principal
  ctx.globalCompositeOperation = 'source-atop';
  ctx.drawImage(shadowCanvas, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
}

function animate() {
  movePlayer();
  drawScene();

  requestAnimationFrame(animate);
}

// faz a luz seguir o mouse
//document.addEventListener('mousemove', (e: MouseEvent) => {
//  const rect = canvas.getBoundingClientRect();
//  lightX = e.clientX - rect.left;
//  lightY = e.clientY - rect.top;
//});

animate();
