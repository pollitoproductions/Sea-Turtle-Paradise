// Sea Turtle Paradise - JavaScript/Canvas version
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

// Modes
const Mode = { WATER: 'WATER', FOOD: 'FOOD' };
let mode = Mode.WATER;

// Game state
const food = [];
const waves = [];
const particles = [];
const turtles = [];
let pointerActive = false;
let lastX = 0, lastY = 0;

// Random utility
function randInt(max) { return Math.floor(Math.random() * max); }
function randDouble(min, max) { return Math.random() * (max - min) + min; }

// Particle class
class Particle {
  constructor(x, y, size, speed, offset, alpha) {
    this.x = x; this.y = y; this.size = size; this.speed = speed; this.offset = offset; this.alpha = alpha;
  }
}
// Food class
class Food {
  constructor(x, y) { this.x = x; this.y = y; this.size = 15; }
  draw(ctx) {
    ctx.fillStyle = '#81cf9d';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
    ctx.fill();
  }
}
// Wave class
class Wave {
  constructor(x, y, life, speed) {
    this.x = x; this.y = y; this.age = 0; this.life = life; this.speed = speed;
  }
  radius() { return 10 + this.age * this.speed; }
}
// Turtle class
class Turtle {
  constructor(x, y, angle, targetAngle, speed, scale, palette) {
    this.x = x; this.y = y; this.angle = angle; this.targetAngle = targetAngle; this.speed = speed; this.scale = scale; this.palette = palette;
  }
  update(width, height, food) {
    if (food.length > 0) {
      const f = food[0];
      const dx = f.x - this.x;
      const dy = f.y - this.y;
      this.targetAngle = Math.atan2(dy, dx);
      this.speed = this.speed * 1.5;
      if (Math.hypot(dx, dy) < 60 * this.scale) {
        food.shift();
      }
    }
    this.angle += (this.targetAngle - this.angle) * 0.05;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.x = Math.max(50, Math.min(width - 50, this.x));
    this.y = Math.max(50, Math.min(height - 50, this.y));
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.scale(this.scale, this.scale);
    // Shell
    ctx.fillStyle = this.palette[0];
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 30, 0, 0, 2 * Math.PI);
    ctx.fill();
    // Head
    ctx.fillStyle = this.palette[1];
    ctx.beginPath();
    ctx.ellipse(20, 0, 20, 15, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
}

function initParticles() {
  for (let i = 0; i < 150; i++) {
    particles.push(new Particle(
      randInt(width),
      randInt(height),
      randDouble(0.5, 2.5),
      randDouble(0.1, 0.6),
      randDouble(0, Math.PI * 2),
      randDouble(0.05, 0.35)
    ));
  }
}
function initTurtles() {
  const palette = ['#178a84', '#8cdada', '#3bbdb8', '#003d3d'];
  for (let i = 0; i < 8; i++) {
    const scale = 0.5 + Math.random();
    turtles.push(new Turtle(
      randInt(width),
      randInt(height),
      randDouble(0, Math.PI * 2),
      randDouble(0, Math.PI * 2),
      (0.4 + Math.random() * 0.5) * scale,
      scale,
      palette
    ));
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  // Deep water background
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#001e36');
  grad.addColorStop(1, '#000714');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Particles
  for (const p of particles) {
    p.y -= p.speed;
    p.x += Math.sin(Date.now() * 0.001 + p.offset) * 0.4;
    if (p.y < -20) {
      p.y = height + 20;
      p.x = randInt(width);
    }
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  // Turtles
  for (const t of turtles) {
    t.update(width, height, food);
    t.draw(ctx);
  }

  // Food
  for (const f of food) {
    f.draw(ctx);
  }

  // Waves
  for (const w of waves) {
    w.age++;
    if (w.age < w.life) {
      ctx.save();
      ctx.strokeStyle = 'rgba(180,230,255,' + (1 - w.age / w.life) * 0.5 + ')';
      ctx.lineWidth = 4 * (1 - w.age / w.life);
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.radius(), 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }
  }
  waves.splice(0, waves.filter(w => w.age >= w.life).length);
}

function loop() {
  draw();
  requestAnimationFrame(loop);
}

canvas.addEventListener('mousedown', e => {
  pointerActive = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
  if (mode === Mode.FOOD) {
    food.push(new Food(lastX, lastY));
    waves.push(new Wave(lastX, lastY, 60, 1.5));
  } else {
    waves.push(new Wave(lastX, lastY, 100, 2.5));
  }
});
canvas.addEventListener('mouseup', () => { pointerActive = false; });
canvas.addEventListener('mousemove', e => {
  if (!pointerActive || mode !== Mode.WATER) return;
  const x = e.offsetX;
  const y = e.offsetY;
  if (Math.hypot(x - lastX, y - lastY) > 25) {
    waves.push(new Wave(x, y, 80, 2));
    lastX = x;
    lastY = y;
  }
});

document.getElementById('toggleBtn').addEventListener('click', () => {
  mode = (mode === Mode.WATER) ? Mode.FOOD : Mode.WATER;
});

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    mode = (mode === Mode.WATER) ? Mode.FOOD : Mode.WATER;
  }
});

initParticles();
initTurtles();
loop();
