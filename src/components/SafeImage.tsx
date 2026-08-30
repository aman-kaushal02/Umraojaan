import { useEffect, useState } from 'react';
import { Film } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  /** Shown inside the placeholder when the frame is missing. */
  fallbackLabel?: string;
  /** Eager-load the hero frame of a scene; everything else stays lazy. */
  priority?: boolean;
}

/**
 * A frame that can't break the projection.
 *
 * No `src`, a typo'd path, a 404 or an unsupported format all resolve to the
 * same unexposed frame, so an unfinished folder never turns into a broken-image
 * icon in the middle of the screening.
 */
export function SafeImage({
  src,
  alt,
  className = '',
  fallbackLabel = 'frame not exposed',
  priority = false,
}: SafeImageProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>(
    src ? 'loading' : 'failed',
  );

  useEffect(() => {
    setStatus(src ? 'loading' : 'failed');
  }, [src]);

  if (status === 'failed') {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`celluloid relative flex flex-col items-center justify-center gap-3 overflow-hidden ${className}`}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(circle at 42% 34%, rgba(227,185,114,0.14), transparent 58%)',
          }}
        />
        <Film aria-hidden="true" className="relative h-6 w-6 text-brass-400/50" strokeWidth={1.1} />
        <span className="slug relative px-6 text-center text-brass-300/50">{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <div className={`celluloid relative overflow-hidden ${className}`}>
      {status === 'loading' && (
        <div aria-hidden="true" className="absolute inset-0 celluloid">
          <div className="absolute inset-0 animate-beam-breathe bg-gradient-to-b from-transparent via-beam-200/10 to-transparent motion-reduce:animate-none" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onLoad={() => setStatus('ready')}
        onError={() => setStatus('failed')}
        className={[
          /* Comes up like a print in the developer: dark and soft, then sharp. */
          'h-full w-full object-cover transition-[opacity,filter,transform] duration-[1600ms] ease-gate',
          status === 'ready'
            ? 'opacity-100 blur-0 scale-100 brightness-100 contrast-100'
            : 'opacity-0 blur-lg scale-[1.06] brightness-[0.35] contrast-[0.7]',
        ].join(' ')}
      />
    </div>
  );
}

export default SafeImage;
