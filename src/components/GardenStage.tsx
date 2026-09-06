import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Lighting } from '../data/scenes';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface GardenStageProps {
  lighting: Lighting;
  showParticles?: boolean;
  children: React.ReactNode;
}

const lightingColors = {
  dawn: {
    bg: 'from-indigo-950 via-purple-900 to-pink-800',
    fog: 'rgba(147, 112, 219, 0.15)',
    glow: 'rgba(255, 182, 193, 0.3)',
  },
  morning: {
    bg: 'from-blue-200 via-pink-100 to-orange-100',
    fog: 'rgba(255, 245, 220, 0.25)',
    glow: 'rgba(255, 223, 186, 0.4)',
  },
  day: {
    bg: 'from-sky-300 via-blue-200 to-emerald-100',
    fog: 'rgba(255, 255, 255, 0.2)',
    glow: 'rgba(255, 253, 208, 0.5)',
  },
  afternoon: {
    bg: 'from-amber-200 via-orange-200 to-pink-200',
    fog: 'rgba(255, 228, 196, 0.3)',
    glow: 'rgba(255, 200, 124, 0.45)',
  },
  dusk: {
    bg: 'from-purple-400 via-pink-300 to-rose-400',
    fog: 'rgba(186, 85, 211, 0.2)',
    glow: 'rgba(255, 105, 180, 0.35)',
  },
};

export function GardenStage({
  lighting,
  showParticles = true,
  children,
}: GardenStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const colors = lightingColors[lighting];

  useEffect(() => {
    if (!showParticles || prefersReducedMotion || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    // Dewdrops / light particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }> = [];

    const particleCount = lighting === 'dawn' ? 40 : lighting === 'dusk' ? 30 : 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: Math.random() * 0.5 + 0.2,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
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

        if (p.y > h + 10) {
          p.y = -10;
          p.x = Math.random() * w;
        }
        if (p.x < -10 || p.x > w + 10) {
          p.x = Math.random() * w;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();

        // Subtle glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${p.alpha * 0.3})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationId);
  }, [lighting, showParticles, prefersReducedMotion]);

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Gradient background with lighting transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={lighting}
          className={`absolute inset-0 bg-gradient-to-b ${colors.bg}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      </AnimatePresence>

      {/* Fog/mist layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 20%, ${colors.fog} 80%)`,
        }}
      />

      {/* Ambient glow from bottom (ground reflection) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at bottom, ${colors.glow}, transparent)`,
        }}
      />

      {/* Particle canvas */}
      {showParticles && !prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
