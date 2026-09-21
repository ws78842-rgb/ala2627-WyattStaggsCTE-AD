const canvas = document.querySelector("#gameCanvas");
const context = canvas.getContext("2d");
const swingButton = document.querySelector("#action");
const resetButton = document.querySelector("#nextAtBat");
const output = document.querySelector("#output");
const scoreOutput = document.querySelector("#score");
const strikesOutput = document.querySelector("#strikes");

const field = {
  batterX: 0.78,
  pitchStart: 0.12,
  pitchEnd: 0.74,
  contactWindow: 0.055
};

let pitch = null;
let score = 0;
let strikes = 0;
let lastTime = 0;
let message = "Watch the pitch. Swing when it reaches the plate.";

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const bounds = canvas.getBoundingClientRect();
  canvas.width = bounds.width * ratio;
  canvas.height = bounds.height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function startPitch() {
  pitch = { progress: 0, speed: 0.00038, swinging: false, result: null };
  message = "Here comes the pitch...";
  updateHud();
}

function swing() {
  if (!pitch || pitch.result) return;

  pitch.swinging = true;
  const distance = Math.abs(pitch.progress - 0.87);

  if (distance <= field.contactWindow) {
    const quality = 1 - distance / field.contactWindow;
    const runs = quality > 0.78 ? 2 : 1;
    score += runs;
    pitch.result = "hit";
    message = runs === 2 ? "CRACK! Ketel Marte drives it to the gap!" : "Base hit! Ketel Marte keeps the inning alive.";
  } else {
    strikes += 1;
    pitch.result = "miss";
    message = strikes >= 3 ? "Strike three. The next at-bat is yours." : "Swing and a miss. Stay locked in.";
  }

  updateHud();
}

function updateHud() {
  scoreOutput.textContent = String(score).padStart(2, "0");
  strikesOutput.textContent = `${strikes} / 3`;
  output.textContent = message;
}

function drawRoundedRect(x, y, width, height, radius) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
}

function drawScene() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const ground = height * 0.68;
  const batterX = width * field.batterX;
  const pitchX = pitch ? width * (field.pitchStart + pitch.progress * (field.pitchEnd - field.pitchStart)) : width * field.pitchStart;

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#112d3f";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#194c45";
  context.fillRect(0, ground, width, height - ground);
  context.fillStyle = "#d5ae63";
  context.beginPath();
  context.moveTo(width * 0.5, ground);
  context.lineTo(width * 0.08, height);
  context.lineTo(width * 0.92, height);
  context.closePath();
  context.fill();

  context.strokeStyle = "rgba(245, 236, 208, .45)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(width * 0.5, ground);
  context.lineTo(width * 0.18, height);
  context.moveTo(width * 0.5, ground);
  context.lineTo(width * 0.82, height);
  context.stroke();

  drawPlayer(width * 0.18, ground - 6, "#f5c842", false);
  drawPlayer(batterX, ground + 34, "#e74d43", true);
  drawPlate(batterX + 12, ground + 67);

  if (pitch) {
    const ballSize = 5 + pitch.progress * 7;
    context.fillStyle = "#fff9e8";
    context.beginPath();
    context.arc(pitchX, ground - 19, ballSize, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#e76c5c";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(pitchX, ground - 19, ballSize - 2, -0.7, 0.7);
    context.stroke();
  }
}

function drawPlayer(x, y, jersey, batting) {
  context.fillStyle = "#f2bd8d";
  context.beginPath();
  context.arc(x, y - 45, 13, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#18202a";
  context.fillRect(x - 14, y - 61, 28, 9);
  context.fillStyle = jersey;
  drawRoundedRect(x - 17, y - 30, 34, 39, 8);
  context.strokeStyle = "#f2bd8d";
  context.lineWidth = 6;
  context.beginPath();
  context.moveTo(x - 10, y - 17);
  context.lineTo(x - 29, y + 2);
  context.moveTo(x + 10, y - 17);
  context.lineTo(x + (batting && pitch?.swinging ? 35 : 22), y - (batting && pitch?.swinging ? 17 : 3));
  context.stroke();
  context.strokeStyle = "#7d4a2b";
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(x + 18, y - 10);
  context.lineTo(x + (batting && pitch?.swinging ? 57 : 38), y - (batting && pitch?.swinging ? 38 : 18));
  context.stroke();
  context.strokeStyle = "#18202a";
  context.lineWidth = 7;
  context.beginPath();
  context.moveTo(x - 8, y + 8);
  context.lineTo(x - 15, y + 40);
  context.moveTo(x + 8, y + 8);
  context.lineTo(x + 17, y + 40);
  context.stroke();
}

function drawPlate(x, y) {
  context.fillStyle = "#fff9e8";
  context.beginPath();
  context.moveTo(x - 17, y);
  context.lineTo(x + 17, y);
  context.lineTo(x + 12, y + 9);
  context.lineTo(x, y + 14);
  context.lineTo(x - 12, y + 9);
  context.closePath();
  context.fill();
}

function frame(time) {
  const elapsed = time - lastTime;
  lastTime = time;

  if (pitch && !pitch.result) {
    pitch.progress += elapsed * pitch.speed;
    if (pitch.progress >= 1) {
      pitch.progress = 1;
      pitch.result = "miss";
      strikes += 1;
      message = "Called strike. The pitcher got the edge.";
      updateHud();
    }
  }

  drawScene();
  requestAnimationFrame(frame);
}

swingButton.addEventListener("click", swing);
resetButton.addEventListener("click", () => {
  strikes = 0;
  message = "New inning. Ktel Mate steps into the box.";
  startPitch();
});
window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    swing();
  }
});
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
startPitch();
requestAnimationFrame(frame);
