import { useEffect, useRef, useState } from 'react';
import { gardenConfig } from '../data/config';

export interface MusicControls {
  isPlaying: boolean;
  toggle: () => void;
  playMusic: () => void;
}

export function useMusic(): MusicControls {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playAttempted = useRef(false);

  useEffect(() => {
    const audio = new Audio(gardenConfig.music.src);
    audio.loop = true;
    audio.volume = gardenConfig.music.volume;
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // iOS fallback: listen for first genuine gesture completion
    const tryUnlock = () => {
      if (playAttempted.current || !audio.paused) return;
      audio.play().catch(() => {
        /* still blocked, wait for another gesture */
      });
    };

    const opts = { passive: true };
    window.addEventListener('touchend', tryUnlock, opts);
    window.addEventListener('click', tryUnlock, opts);
    window.addEventListener('keydown', tryUnlock, opts);

    return () => {
      audio.pause();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      window.removeEventListener('touchend', tryUnlock);
      window.removeEventListener('click', tryUnlock);
      window.removeEventListener('keydown', tryUnlock);
    };
  }, []);

  const playMusic = () => {
    if (!audioRef.current || playAttempted.current) return;
    playAttempted.current = true;
    audioRef.current.play().catch(() => {
      /* Autoplay blocked — fallback gestures will retry */
    });
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  return { isPlaying, toggle, playMusic };
}
