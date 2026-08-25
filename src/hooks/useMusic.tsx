import { createContext, useContext, type ReactNode } from 'react';
import { birthdayConfig } from '@/data/config';
import { useAudioPlayer, type AudioPlayer } from './useAudioPlayer';
import { useExperience } from './useExperience';

/**
 * One soundtrack, shared by the whole experience.
 *
 * The player is created once, above the scene switch, so the track keeps
 * playing uninterrupted as chapters come and go. Exposing it through context
 * lets a scene's own button start playback inside its click handler — the only
 * approach mobile Safari consistently allows.
 */
const MusicContext = createContext<AudioPlayer | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const { hasInteracted } = useExperience();

  const player = useAudioPlayer({
    src: birthdayConfig.music.src,
    volume: birthdayConfig.music.volume,
    autoplay: birthdayConfig.music.autoplay,
    unlocked: hasInteracted,
  });

  return <MusicContext.Provider value={player}>{children}</MusicContext.Provider>;
}

export function useMusic(): AudioPlayer {
  const player = useContext(MusicContext);
  if (!player) {
    throw new Error('useMusic must be used inside <MusicProvider>.');
  }
  return player;
}
