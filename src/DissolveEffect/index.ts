const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
let sprite: HTMLImageElement;
let imageData: ImageData | null = null;
let animationTime: number = 0;
let effectDuration: number = 3000; // Effect duration

ctx.imageSmoothingEnabled = false;

// load sprite and start animation
function init() {
    sprite = new Image();
    sprite.src = '../../assets/sprite.png';
    sprite.onload = () => {
        initImageData();
        animate();
    };
}

// draw sprite and get image data
function initImageData() {
    ctx.drawImage(sprite, 0, 0, 64, 64);
    imageData = ctx.getImageData(0, 0, 64, 64);
}

function animate(): void {
    animationTime += 16.66;
    if (animationTime > effectDuration) animationTime = 0; // restart animation

    if (imageData) {
      // creates a new imageData() for manipulation
      const outputData = new ImageData(imageData.width, imageData.height);
      const progress = animationTime / effectDuration;

      for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++) {
          const i = (y * imageData.width + x) * 4;

          // Dissolve effect: change alpha channel based on progress
          const noise = Math.random();
          const dissolveThreshold = progress * 1.5;
          const alpha = noise < dissolveThreshold ? 0 : imageData.data[i + 3];

          // Efeito de glitch: deslocamento aleatório em algumas linhas
          let offsetX = 0;
          const srcX = Math.min(Math.max(x + offsetX, 0), imageData.width - 1);
          const srcI = (y * imageData.width + srcX) * 4;

          // Copia os pixels com o alfa ajustado
          outputData.data[i] = imageData.data[srcI]; // R
          outputData.data[i + 1] = imageData.data[srcI + 1]; // G
          outputData.data[i + 2] = imageData.data[srcI + 2]; // B
          outputData.data[i + 3] = alpha; // A
        }
      }

      // Limpa o canvas e desenha a imagem manipulada
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(outputData, 100, 100); // Posição ajustável
  }

    requestAnimationFrame(animate);
}

export { init, initImageData, animate };
