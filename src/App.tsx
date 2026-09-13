import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useAppHeight } from './hooks/useAppHeight';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { useInitPointerField } from './hooks/usePointerField';
import { useCosmos } from './hooks/useCosmos';
import { useCelestialAudio } from './hooks/useCelestialAudio';
import { useSoundtrack } from './hooks/useSoundtrack';

import { StarFieldCanvas } from './components/cosmos/StarFieldCanvas';
import { ConstellationLayer } from './components/cosmos/ConstellationLayer';
import { MeteorShower } from './components/cosmos/MeteorShower';
import { Atmosphere } from './components/cosmos/Atmosphere';
import { LensGlow } from './components/cosmos/LensGlow';
import { SkyHud } from './components/cosmos/SkyHud';
import { MemoryCard } from './components/cosmos/MemoryCard';

import { Overture } from './scenes/cosmos/Overture';
import { NamedScene } from './scenes/cosmos/NamedScene';
import { LetterScene } from './scenes/cosmos/LetterScene';

import { memories } from './data/cosmos';

const EASE = [0.16, 1, 0.3, 1] as const;

/** How the constellation sits in frame at each beat of the story. */
const FRAMING: Record<string, { scale: number; y: string; opacity: number; blur: number }> = {
  overture: { scale: 1, y: '0vh', opacity: 1, blur: 0 },
  sky: { scale: 1, y: '0vh', opacity: 1, blur: 0 },
  gathering: { scale: 1, y: '0vh', opacity: 1, blur: 0 },
  drawing: { scale: 1, y: '0vh', opacity: 1, blur: 0 },
  named: { scale: 0.8, y: '-6vh', opacity: 1, blur: 0 },
  letter: { scale: 1.08, y: '0vh', opacity: 0.16, blur: 3 },
};

export default function App() {
  useAppHeight();
  useInitPointerField();
  const reducedMotion = usePrefersReducedMotion();

  const sky = useCosmos();
  const audio = useCelestialAudio();
  const score = useSoundtrack();

  const lastPhase = useRef(sky.phase);

  /* --- sound cues, keyed to the story ---------------------------------- */
  useEffect(() => {
    if (lastPhase.current === sky.phase) return;
    lastPhase.current = sky.phase;

    if (sky.phase === 'sky') {
      audio.unlock();
      score.start();
    }
    if (sky.phase === 'gathering') audio.swell();
    if (sky.phase === 'named') {
      audio.rush();
      score.duck(1.15, 2000);
    }
    if (sky.phase === 'letter') audio.resolve();
  }, [sky.phase, audio, score]);

  const handleFind = (i: number) => {
    audio.chime(memories[i].tone);
    score.duck(0.42, 700);
    sky.findStar(i);
  };

  const handleClose = () => {
    score.duck(1, 1400);
    sky.closeCard();
  };

  const frame = FRAMING[sky.phase] ?? FRAMING.sky;
  const showStars = sky.phase !== 'overture';
  const warmth = sky.phase === 'named' ? 0.7 : sky.phase === 'letter' ? 1 : 0;

  return (
    <>
      {/* Deep space base. Sits under the canvas so the gradient still shows
          through the transparent parts of the star plate. */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(140% 100% at 50% 8%, #16143a 0%, #0b0a24 34%, #05060f 68%, #020309 100%)',
        }}
      />

      <StarFieldCanvas intensity={showStars ? 1 : 0.42} reducedMotion={reducedMotion} />

      {/* The nine, plus the tulip they become. */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-20"
        animate={{
          scale: frame.scale,
          y: frame.y,
          opacity: frame.opacity,
          filter: `blur(${frame.blur}px)`,
        }}
        transition={{ duration: reducedMotion ? 0.01 : 2, ease: EASE }}
        style={{ transformOrigin: '50% 46%' }}
      >
        <ConstellationLayer
          phase={sky.phase}
          found={sky.found}
          activeIndex={sky.activeIndex}
          hint={sky.nudge}
          onFind={handleFind}
          reducedMotion={reducedMotion}
        />
      </motion.div>

      <MeteorShower
        active={sky.phase === 'named' || sky.phase === 'letter'}
        reducedMotion={reducedMotion}
      />

      <Atmosphere warmth={warmth} reducedMotion={reducedMotion} />

      <SkyHud
        visible={sky.phase === 'sky' && sky.activeIndex === null}
        foundCount={sky.foundCount}
        nudge={sky.nudge}
        soundOn={score.wanted}
        onToggleSound={() => {
          audio.unlock();
          score.toggle();
        }}
      />

      <AnimatePresence mode="wait">
        {sky.phase === 'overture' && (
          <Overture
            key="overture"
            reducedMotion={reducedMotion}
            /* Both of these have to fire inside the click itself: iOS only
               unlocks audio from within a genuine gesture, and the phase
               effect below runs a tick too late to count. */
            onEnter={() => {
              audio.unlock();
              score.start();
              sky.enterSky();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sky.activeIndex !== null && (
          <MemoryCard
            key={`card-${sky.activeIndex}`}
            memory={memories[sky.activeIndex]}
            index={sky.activeIndex}
            total={memories.length}
            isLast={sky.foundCount === memories.length}
            reducedMotion={reducedMotion}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sky.phase === 'named' && (
          <NamedScene key="named" onWish={sky.wish} reducedMotion={reducedMotion} />
        )}
        {sky.phase === 'letter' && (
          <LetterScene key="letter" onLookAgain={sky.lookAgain} reducedMotion={reducedMotion} />
        )}
      </AnimatePresence>

      <LensGlow />
    </>
  );
}
