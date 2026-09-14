const canvas = document.querySelector('#constellation');
const context = canvas.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let width = 0;
let height = 0;
let points = [];

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  points = Array.from({ length: Math.min(42, Math.floor(width / 28)) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    speed: Math.random() * 0.16 + 0.04,
    size: Math.random() * 1.5 + 0.4
  }));
}

function drawConstellation() {
  context.clearRect(0, 0, width, height);
  points.forEach((point, index) => {
    point.y -= point.speed;
    if (point.y < -10) point.y = height + 10;
    context.beginPath();
    context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
    context.fillStyle = 'rgba(213, 242, 111, .4)';
    context.fill();

    const next = points[(index + 1) % points.length];
    const distance = Math.hypot(point.x - next.x, point.y - next.y);
    if (distance < 115) {
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(next.x, next.y);
      context.strokeStyle = `rgba(213, 242, 111, ${0.1 - distance / 1400})`;
      context.stroke();
    }
  });
  if (!reduceMotion) requestAnimationFrame(drawConstellation);
}

resizeCanvas();
drawConstellation();
window.addEventListener('resize', resizeCanvas);

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  });
});
