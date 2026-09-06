import { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Lighting } from '../data/scenes';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface GardenStageProps {
  lighting: Lighting;
  showParticles?: boolean;
  children: React.ReactNode;
}

const lightingScenes = {
  dawn: {
    gradient: 'linear-gradient(165deg, #0f0a1a 0%, #1a0e2e 30%, #2e1645 60%, #4a2c5a 100%)',
    ambient: 'rgba(138, 85, 156, 0.15)',
    glow: 'rgba(186, 85, 211, 0.25)',
    particles: 30,
  },
  morning: {
    gradient: 'linear-gradient(165deg, #ffd6e8 0%, #ffc4dd 20%, #a8c8ff 50%, #c4e0ff 100%)',
    ambient: 'rgba(255, 228, 240, 0.3)',
    glow: 'rgba(255, 182, 193, 0.4)',
    particles: 50,
  },
  day: {
    gradient: 'linear-gradient(165deg, #87ceeb 0%, #b4e0ff 30%, #d4f0ff 60%, #b8e6d5 100%)',
    ambient: 'rgba(255, 255, 255, 0.25)',
    glow: 'rgba(135, 206, 235, 0.35)',
    particles: 65,
  },
  afternoon: {
    gradient: 'linear-gradient(165deg, #ffd89b 0%, #ffb88c 30%, #ffa47a 60%, #ff9a76 100%)',
    ambient: 'rgba(255, 200, 124, 0.3)',
    glow: 'rgba(255, 154, 118, 0.4)',
    particles: 55,
  },
  dusk: {
    gradient: 'linear-gradient(165deg, #8e44ad 0%, #c06c84 30%, #f67280 60%, #f8b195 100%)',
    ambient: 'rgba(198, 108, 132, 0.2)',
    glow: 'rgba(246, 114, 128, 0.35)',
    particles: 40,
  },
};

export function GardenStage({
  lighting,
  showParticles = true,
  children,
}: GardenStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const scene = lightingScenes[lighting];

  // Ambient glow positions — deterministic per lighting
  const glowOrbs = useMemo(() => {
    const seeds = { dawn: [0.3, 0.7], morning: [0.2, 0.8], day: [0.5, 0.5], afternoon: [0.6, 0.4], dusk: [0.7, 0.6] };
    const [x, y] = seeds[lighting] || [0.5, 0.5];
    return [
      { x: x * 100, y: y * 100, size: 45, opacity: 0.6 },
      { x: (1 - x) * 100, y: (1 - y) * 100, size: 35, opacity: 0.4 },
    ];
  }, [lighting]);

  useEffect(() => {
    if (!showParticles || reducedMotion || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      twinkle: number;
    }

    const particles: Particle[] = [];
    const count = scene.particles;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() * 0.6) + 0.3,
        radius: Math.random() * 2.5 + 0.8,
        alpha: Math.random() * 0.6 + 0.2,
        twinkle: Math.random() * Math.PI * 2,
      });
    }

    let animationId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 16.667, 2);
      lastTime = time;

      ctx.clearRect(0, 0, w, h);

      particles.forEach((p) => {
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.twinkle += 0.02 * delta;

        if (p.y > h + 20) {
          p.y = -20;
          p.x = Math.random() * w;
        }
        if (p.x < -20 || p.x > w + 20) {
          p.x = Math.random() * w;
        }

        const twinkleAlpha = p.alpha * (0.5 + Math.sin(p.twinkle) * 0.5);

        // Particle core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkleAlpha})`;
        ctx.fill();

        // Soft glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${twinkleAlpha * 0.4})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationId);
  }, [lighting, showParticles, reducedMotion, scene.particles]);

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={lighting}
          className="absolute inset-0"
          style={{ background: scene.gradient }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.5, ease: [0.19, 1.0, 0.22, 1.0] }}
        />
      </AnimatePresence>

      {/* Ambient glow orbs */}
      {glowOrbs.map((orb, i) => (
        <motion.div
          key={`${lighting}-${i}`}
          className="absolute ambient-glow"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}vmin`,
            height: `${orb.size}vmin`,
            background: scene.glow,
            opacity: orb.opacity,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: orb.opacity }}
          transition={{ duration: 3, ease: 'easeOut' }}
        />
      ))}

      {/* Subtle vignette */}
      <div className="vignette" />

      {/* Floating atmospheric mist */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 80%, ${scene.ambient}, transparent 65%)`,
        }}
      />

      {/* Particle canvas */}
      {showParticles && !reducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-90"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      {/* Content layer. Scenes own their own padding so nothing is
          double-inset, and tall scenes are free to grow and scroll. */}
      <div className="relative z-10 w-full flex items-stretch justify-center">
        {children}
      </div>
    </div>
  );
}
