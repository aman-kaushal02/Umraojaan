import { AnimatePresence, motion } from 'framer-motion';
import { cosmos, memories } from '../../data/cosmos';

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  visible: boolean;
  foundCount: number;
  nudge: boolean;
  soundOn: boolean;
  onToggleSound: () => void;
}

export function SkyHud({ visible, foundCount, nudge, soundOn, onToggleSound }: Props) {
  const total = memories.length;

  return (
    <>
      {/* ---------------- tally ---------------- */}
      <AnimatePresence>
        {visible && (
          <motion.div
            className="hud hud--tl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <div className="flex items-center gap-[7px]">
              {Array.from({ length: total }, (_, i) => (
                <motion.span
                  key={i}
                  className="hud__pip"
                  data-lit={i < foundCount ? 'true' : 'false'}
                  initial={false}
                  animate={{
                    rotate: 45,
                    scale: i < foundCount ? 1 : 0.72,
                  }}
                  transition={{ duration: 0.7, ease: EASE, delay: i < foundCount ? 0.1 : 0 }}
                />
              ))}
            </div>
            <p className="hud__label">
              <span className="tabular-nums text-star-gold">{foundCount}</span>
              <span className="text-paper-100/30"> / {total} </span>
              {cosmos.sky.counterLabel}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- sound ---------------- */}
      <div className="hud hud--tr pointer-events-auto">
        <button
          type="button"
          onClick={onToggleSound}
          className="sound-toggle"
          aria-label={soundOn ? 'Mute the sky' : 'Turn the sound on'}
        >
          <span className="sound-toggle__bars" data-on={soundOn ? 'true' : 'false'}>
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="sound-toggle__text">{soundOn ? 'Sound on' : 'Sound off'}</span>
        </button>
      </div>

      {/* ---------------- prompt ---------------- */}
      <AnimatePresence>
        {visible && (
          <motion.div
            className="hud hud--bottom"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 1, ease: EASE }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={nudge ? 'nudge' : 'prompt'}
                className="hud__prompt"
                initial={{ opacity: 0, filter: 'blur(6px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(6px)' }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                {nudge ? cosmos.sky.nudge : cosmos.sky.prompt}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
