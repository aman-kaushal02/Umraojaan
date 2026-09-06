import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface TulipBudProps {
  color: 'coral' | 'pink' | 'rose' | 'blush' | 'peach' | 'salmon';
  isBloom: boolean;
  onBloomComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
  delay?: number;
}

const colorPalettes = {
  coral: {
    outer: ['#ff6b6b', '#ff8787'],
    inner: ['#ffb4b4', '#ffd6d6'],
    glow: 'rgba(255, 107, 107, 0.6)',
  },
  pink: {
    outer: ['#ffb3d9', '#ffc8e3'],
    inner: ['#ffd6ed', '#ffe8f5'],
    glow: 'rgba(255, 179, 217, 0.6)',
  },
  rose: {
    outer: ['#ff69b4', '#ff85c1'],
    inner: ['#ffb6d9', '#ffd0e8'],
    glow: 'rgba(255, 105, 180, 0.6)',
  },
  blush: {
    outer: ['#ffc0cb', '#ffd0d8'],
    inner: ['#ffe4e8', '#fff0f3'],
    glow: 'rgba(255, 192, 203, 0.6)',
  },
  peach: {
    outer: ['#ffdab9', '#ffe4cc'],
    inner: ['#ffe8d6', '#fff3e8'],
    glow: 'rgba(255, 218, 185, 0.6)',
  },
  salmon: {
    outer: ['#fa8072', '#ff9c8e'],
    inner: ['#ffc4bc', '#ffd8d1'],
    glow: 'rgba(250, 128, 114, 0.6)',
  },
};

const sizeConfig = {
  small: { scale: 0.65, stem: 100 },
  medium: { scale: 1, stem: 140 },
  large: { scale: 1.35, stem: 180 },
};

export function TulipBud({
  color,
  isBloom,
  onBloomComplete,
  size = 'medium',
  delay = 0,
}: TulipBudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stemRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const palette = colorPalettes[color];
  const config = sizeConfig[size];

  useEffect(() => {
    if (!containerRef.current || reducedMotion) return;

    const petals = containerRef.current.querySelectorAll('[data-petal]');
    const center = containerRef.current.querySelector('[data-center]');
    const stem = stemRef.current;

    if (isBloom) {
      const tl = gsap.timeline({
        delay,
        onComplete: onBloomComplete,
      });

      // Stem grows with elastic ease
      if (stem) {
        tl.from(stem, {
          scaleY: 0,
          transformOrigin: 'bottom center',
          duration: 1.2,
          ease: 'elastic.out(1, 0.6)',
        });
      }

      // Petals unfurl in elegant sequence
      petals.forEach((petal, i) => {
        const angle = i * 60;
        const rotateX = 70 + (i % 2) * 15;
        const rotateY = (i % 2 === 0 ? 1 : -1) * (25 + i * 3);
        
        tl.to(
          petal,
          {
            rotateX,
            rotateY,
            rotateZ: angle + (i % 2 === 0 ? 8 : -8),
            scale: 1.08,
            duration: 1.6,
            ease: 'power3.out',
          },
          `-=${i === 0 ? 0 : 1.2}`
        );
      });

      // Center glow reveals
      if (center) {
        tl.to(
          center,
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power2.out',
          },
          '-=0.6'
        );
      }

      // Add subtle continuous sway after bloom
      tl.add(() => {
        gsap.to(containerRef.current, {
          rotateZ: 3,
          duration: 3,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });

        petals.forEach((petal, i) => {
          gsap.to(petal, {
            rotateY: `+=${(i % 2 === 0 ? 1 : -1) * 5}`,
            duration: 4 + i * 0.3,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
          });
        });
      });
    } else {
      // Closed bud — gentle breathing
      gsap.to(petals, {
        scale: 1.03,
        duration: 3,
        stagger: 0.15,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    }
  }, [isBloom, delay, onBloomComplete, reducedMotion]);

  if (reducedMotion) {
    return (
      <div
        className="flex flex-col items-center gap-2"
        style={{ transform: `scale(${config.scale})` }}
      >
        <div
          className="relative w-28 h-28 rounded-full shadow-lg"
          style={{
            background: `radial-gradient(circle, ${palette.inner[0]}, ${palette.outer[0]})`,
          }}
        />
        <div
          className="w-2 rounded-full shadow-md"
          style={{
            height: `${config.stem}px`,
            background: 'linear-gradient(to bottom, #4a7c59, #2d5a3d)',
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center relative"
      style={{
        transform: `scale(${config.scale})`,
        perspective: '1200px',
      }}
      initial={{ opacity: 0, y: 30, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 1.2,
        delay: delay * 0.5,
        ease: [0.19, 1.0, 0.22, 1.0],
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute w-full h-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${palette.glow}, transparent 60%)`,
          filter: 'blur(40px)',
          opacity: isBloom ? 0.8 : 0.3,
          transition: 'opacity 1.5s ease',
        }}
      />

      {/* Petals container */}
      <div
        ref={containerRef}
        className="relative preserve-3d"
        style={{
          width: '160px',
          height: '160px',
          transformStyle: 'preserve-3d',
          transform: 'rotateX(-12deg)',
        }}
      >
        {/* Six layered petals */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = i * 60;
          const radius = 32;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <div
              key={i}
              data-petal
              className="absolute top-1/2 left-1/2 backface-hidden preserve-3d"
              style={{
                width: '70px',
                height: '90px',
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle}deg)`,
                transformOrigin: 'center bottom',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Outer petal surface */}
              <div
                className="absolute inset-0 rounded-t-full shadow-xl"
                style={{
                  background: `linear-gradient(to top, ${palette.outer[1]}, ${palette.outer[0]})`,
                  boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3)
                  `,
                }}
              />

              {/* Inner gradient highlight */}
              <div
                className="absolute inset-0 rounded-t-full opacity-70"
                style={{
                  background: `linear-gradient(to top, transparent 40%, ${palette.inner[0]} 100%)`,
                }}
              />

              {/* Subtle vein detail */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3/4 opacity-20"
                style={{
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
                }}
              />
            </div>
          );
        })}

        {/* Center stamen (visible when bloomed) */}
        <div
          data-center
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fff8dc 20%, #ffd700 70%, #daa520)',
            boxShadow: `
              0 0 20px rgba(255, 215, 0, 0.6),
              inset 0 2px 8px rgba(255, 255, 255, 0.5)
            `,
            transform: 'scale(0.7)',
          }}
        >
          {/* Pollen dots */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * 60 * Math.PI) / 180;
            const r = 14;
            const cx = 50 + Math.cos(angle) * r;
            const cy = 50 + Math.sin(angle) * r;

            return (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-orange-900 shadow-sm"
                style={{
                  left: `${cx}%`,
                  top: `${cy}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Stem with organic curve */}
      <div className="relative" style={{ height: `${config.stem}px`, width: '8px' }}>
        <div
          ref={stemRef}
          className="absolute bottom-0 left-0 w-full h-full rounded-full shadow-lg preserve-3d"
          style={{
            background: 'linear-gradient(to bottom, #5c8a6f 0%, #4a7c59 40%, #2d5a3d 100%)',
            boxShadow: `
              -2px 0 8px rgba(0, 0, 0, 0.2),
              inset 1px 0 0 rgba(255, 255, 255, 0.15)
            `,
          }}
        >
          {/* Leaf */}
          <div
            className="absolute preserve-3d"
            style={{
              width: '32px',
              height: '48px',
              left: '-16px',
              top: '45%',
              background: 'linear-gradient(135deg, #5c8a6f 0%, #3d6b4e 100%)',
              clipPath: 'ellipse(45% 60% at 40% 45%)',
              transform: 'rotateY(-30deg) rotateZ(-28deg)',
              boxShadow: '-2px 4px 12px rgba(0, 0, 0, 0.25)',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
