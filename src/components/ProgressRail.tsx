import { motion } from 'framer-motion';
import { EASE_SILK } from '../animations/motion';

interface ProgressRailProps {
  /** 0–1 through the whole garden. */
  progress: number;
  /** Number of tick marks to draw. */
  ticks: number;
}

/**
 * A hairline rail across the top of the frame.
 *
 * Reads as a chapter indicator without ever asking to be looked at: unfilled
 * it's barely visible, and the filled portion carries a soft leading glow.
 */
export function ProgressRail({ progress, ticks }: ProgressRailProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[3px]"
    >
      <div className="relative h-full w-full bg-white/[0.07]">
        <motion.div
          className="absolute inset-y-0 left-0 origin-left"
          style={{
            background:
              'linear-gradient(to right, rgba(255,201,135,0.5), rgba(255,226,232,0.95))',
            boxShadow: '0 0 12px rgba(255,214,232,0.65)',
          }}
          initial={{ width: '0%' }}
          animate={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
          transition={{ duration: 1.1, ease: EASE_SILK }}
        />

        {/* Ticks marking each bloom. */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: ticks }).map((_, i) => (
            <div key={i} className="relative flex-1">
              {i > 0 && <span className="absolute left-0 top-0 h-full w-px bg-loam-950/40" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
