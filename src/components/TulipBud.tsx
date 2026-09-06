import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface TulipBudProps {
  color: 'coral' | 'pink' | 'rose' | 'blush' | 'peach' | 'salmon';
  isBloom: boolean;
  onBloomComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
}

const colorMap = {
  coral: { outer: '#FF6B6B', inner: '#FFB4B4', shadow: '#CC5555' },
  pink: { outer: '#FFB3D9', inner: '#FFD6ED', shadow: '#CC8FAE' },
  rose: { outer: '#FF69B4', inner: '#FFB6D9', shadow: '#CC5490' },
  blush: { outer: '#FFC0CB', inner: '#FFE4E8', shadow: '#CC99A2' },
  peach: { outer: '#FFDAB9', inner: '#FFE8D6', shadow: '#CCAE94' },
  salmon: { outer: '#FA8072', inner: '#FFC4BC', shadow: '#C8665B' },
};

const sizeMap = {
  small: { scale: 0.6, stem: 80 },
  medium: { scale: 1, stem: 120 },
  large: { scale: 1.4, stem: 160 },
};

export function TulipBud({
  color,
  isBloom,
  onBloomComplete,
  size = 'medium',
}: TulipBudProps) {
  const petalsRef = useRef<HTMLDivElement>(null);
  const stemRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const colors = colorMap[color];
  const dimensions = sizeMap[size];

  useEffect(() => {
    if (!petalsRef.current || prefersReducedMotion) return;

    const petals = petalsRef.current.querySelectorAll('[data-petal]');

    if (isBloom) {
      const tl = gsap.timeline({
        defaults: { ease: 'elastic.out(1, 0.5)' },
        onComplete: onBloomComplete,
      });

      // Stem grows first
      if (stemRef.current) {
        tl.from(stemRef.current, {
          scaleY: 0,
          transformOrigin: 'bottom center',
          duration: 0.8,
          ease: 'power2.out',
        });
      }

      // Then petals unfurl in sequence
      petals.forEach((petal, i) => {
        tl.to(
          petal,
          {
            rotateX: 60 + i * 5,
            rotateY: i % 2 === 0 ? 20 : -20,
            scale: 1.1,
            duration: 1.2,
          },
          `-=0.9`
        );
      });

      // Center glow appears
      tl.to(
        '[data-center]',
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out',
        },
        '-=0.4'
      );
    } else {
      // Closed bud state with subtle breathing
      gsap.to(petals, {
        scale: 1.02,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.1,
      });
    }
  }, [isBloom, onBloomComplete, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div
        className="flex flex-col items-center"
        style={{ transform: `scale(${dimensions.scale})` }}
      >
        <div className="relative w-24 h-24">
          <div
            className="absolute inset-0 rounded-full opacity-80"
            style={{ background: colors.outer }}
          />
          {isBloom && (
            <div
              className="absolute inset-4 rounded-full"
              style={{ background: colors.inner }}
            />
          )}
        </div>
        <div
          className="w-1 bg-green-700 rounded-full"
          style={{ height: `${dimensions.stem}px` }}
        />
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center"
      style={{
        transform: `scale(${dimensions.scale})`,
        perspective: '1000px',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Petals container */}
      <div
        ref={petalsRef}
        className="relative w-32 h-32"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(-10deg)',
        }}
      >
        {/* Six petals arranged in circle */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i * 60 * Math.PI) / 180;
          const x = Math.cos(angle) * 24;
          const y = Math.sin(angle) * 24;

          return (
            <div
              key={i}
              data-petal
              className="absolute top-1/2 left-1/2 w-16 h-20 rounded-t-full shadow-lg"
              style={{
                background: `linear-gradient(to top, ${colors.shadow}, ${colors.outer})`,
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${i * 60}deg)`,
                transformOrigin: 'center bottom',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              <div
                className="absolute inset-0 rounded-t-full opacity-60"
                style={{
                  background: `linear-gradient(to top, transparent, ${colors.inner})`,
                }}
              />
            </div>
          );
        })}

        {/* Center of flower (visible when bloomed) */}
        <div
          data-center
          className="absolute top-1/2 left-1/2 w-8 h-8 rounded-full opacity-0"
          style={{
            background: `radial-gradient(circle, #FFF8DC, #FFD700)`,
            transform: 'translate(-50%, -50%) scale(0.5)',
            boxShadow: '0 0 12px rgba(255, 215, 0, 0.6)',
          }}
        >
          {/* Stamen dots */}
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = (i * 72 * Math.PI) / 180;
            const cx = 50 + Math.cos(angle) * 30;
            const cy = 50 + Math.sin(angle) * 30;
            return (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-orange-800"
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

      {/* Stem */}
      <div
        ref={stemRef}
        className="w-1.5 rounded-full shadow-sm"
        style={{
          height: `${dimensions.stem}px`,
          background: 'linear-gradient(to bottom, #4A7C59, #2D5A3D)',
        }}
      >
        {/* Leaf */}
        <div
          className="absolute w-6 h-10 rounded-full"
          style={{
            left: '-8px',
            top: '40%',
            background: 'linear-gradient(135deg, #5C8A6F, #3D6B4E)',
            transform: 'rotate(-25deg)',
            clipPath: 'ellipse(50% 60% at 50% 40%)',
          }}
        />
      </div>
    </motion.div>
  );
}
