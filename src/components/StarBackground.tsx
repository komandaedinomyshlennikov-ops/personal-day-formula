import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  hue: number;
}

export function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createStars = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const count = Math.min(160, Math.floor((w * h) / 9000));
      const stars: Star[] = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 1.6 + 0.3,
          speed: Math.random() * 0.015 + 0.003,
          opacity: Math.random() * 0.55 + 0.2,
          twinkleSpeed: Math.random() * 0.015 + 0.006,
          twinklePhase: Math.random() * Math.PI * 2,
          hue: Math.random() > 0.85 ? 45 : Math.random() > 0.5 ? 270 : 0,
        });
      }
      starsRef.current = stars;
    };

    const drawFrame = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.fillStyle = '#07060d';
      ctx.fillRect(0, 0, w, h);

      // Soft nebula layers
      const g1 = ctx.createRadialGradient(w * 0.5, h * 0.05, 0, w * 0.5, h * 0.2, w * 0.7);
      g1.addColorStop(0, 'rgba(124, 58, 237, 0.22)');
      g1.addColorStop(0.55, 'rgba(88, 28, 135, 0.06)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      const g2 = ctx.createRadialGradient(w * 0.85, h * 0.25, 0, w * 0.85, h * 0.25, w * 0.4);
      g2.addColorStop(0, 'rgba(236, 72, 153, 0.1)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      const g3 = ctx.createRadialGradient(w * 0.15, h * 0.7, 0, w * 0.15, h * 0.7, w * 0.35);
      g3.addColorStop(0, 'rgba(245, 215, 142, 0.06)');
      g3.addColorStop(1, 'transparent');
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, w, h);

      starsRef.current.forEach((star) => {
        if (!prefersReduced) {
          star.twinklePhase += star.twinkleSpeed;
          star.y -= star.speed;
          if (star.y < 0) {
            star.y = h;
            star.x = Math.random() * w;
          }
        }
        const twinkle = prefersReduced ? 1 : Math.sin(star.twinklePhase) * 0.28 + 0.72;
        const op = star.opacity * twinkle;

        let color = `rgba(255,255,255,${op})`;
        if (star.hue === 45) color = `rgba(245,215,142,${op})`;
        if (star.hue === 270) color = `rgba(196,181,253,${op})`;

        const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3.5);
        glow.addColorStop(0, color);
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      if (!prefersReduced) {
        animationRef.current = requestAnimationFrame(drawFrame);
      }
    };

    resizeCanvas();
    createStars();
    drawFrame();

    const onResize = () => {
      resizeCanvas();
      createStars();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      aria-hidden
      style={{ background: '#07060d' }}
    />
  );
}
