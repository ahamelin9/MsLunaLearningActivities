// Lightweight, Zero-Dependency Canvas Particle Confetti Engine

export interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: 'star' | 'circle' | 'rect';
  opacity: number;
}

const COLORS = [
  '#FF5964', '#FF9F1C', '#FFD166', '#06D6A0', '#118AB2', '#9D4EDD', '#FF70A6', '#70D6FF'
];

export function launchConfetti(canvas: HTMLCanvasElement | null, durationMs = 3000) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: ConfettiParticle[] = [];
  const particleCount = 120;

  for (let i = 0; i < particleCount; i++) {
    const isLeft = Math.random() > 0.5;
    const startX = isLeft ? canvas.width * 0.2 : canvas.width * 0.8;
    const angle = isLeft ? (Math.random() * 0.5 + 0.2) * -Math.PI : (Math.random() * 0.5 + 0.3) * -Math.PI;
    const speed = Math.random() * 14 + 10;

    particles.push({
      x: startX,
      y: canvas.height * 0.85,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 6,
      vy: Math.sin(angle) * speed - Math.random() * 6,
      size: Math.random() * 10 + 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      shape: Math.random() > 0.6 ? 'star' : Math.random() > 0.3 ? 'rect' : 'circle',
      opacity: 1
    });
  }

  const startTime = performance.now();

  function drawStar(c: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    c.beginPath();
    c.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      c.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      c.lineTo(x, y);
      rot += step;
    }
    c.lineTo(cx, cy - outerRadius);
    c.closePath();
    c.fill();
  }

  function frame(now: number) {
    if (!ctx || !canvas) return;
    const elapsed = now - startTime;
    const progress = elapsed / durationMs;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38;
      p.vx *= 0.98;
      p.rotation += p.rotationSpeed;

      if (progress > 0.7) {
        p.opacity = Math.max(0, 1 - (progress - 0.7) / 0.3);
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'star') {
        drawStar(ctx, 0, 0, 5, p.size, p.size / 2);
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.7);
      }

      ctx.restore();
    });

    if (elapsed < durationMs) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(frame);
}

