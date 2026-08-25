import { useEffect, useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  /** Shown inside the placeholder when the image is missing. */
  fallbackLabel?: string;
  /** Eager-load the hero image of a scene; everything else stays lazy. */
  priority?: boolean;
}

/**
 * An image that can't break the page.
 *
 * No `src`, a typo'd path, a 404 or an unsupported format all resolve to the
 * same elegant placeholder frame, so an unfinished photo folder never turns
 * into a broken-image icon in the middle of a love letter.
 */
export function SafeImage({
  src,
  alt,
  className = '',
  fallbackLabel = 'Add your photo here',
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
        className={`relative flex flex-col items-center justify-center gap-3 overflow-hidden bg-gradient-to-br from-ivory-200 via-blush-100 to-ivory-300 ${className}`}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(circle at 30% 26%, rgba(224,190,134,0.35), transparent 55%), radial-gradient(circle at 74% 78%, rgba(173,91,107,0.22), transparent 58%)',
          }}
        />
        <ImageIcon
          aria-hidden="true"
          className="relative h-7 w-7 text-rose-500/45"
          strokeWidth={1.1}
        />
        <span className="relative px-6 text-center font-sans text-[0.6rem] uppercase tracking-[0.24em] text-rose-600/55">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-ivory-200 ${className}`}>
      {status === 'loading' && (
        <div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden bg-ivory-200"
        >
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent motion-reduce:animate-none" />
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
          'h-full w-full object-cover transition-[opacity,filter,transform] duration-[1200ms] ease-silk',
          status === 'ready'
            ? 'opacity-100 blur-0 scale-100'
            : 'opacity-0 blur-md scale-[1.04]',
        ].join(' ')}
      />
    </div>
  );
}

export default SafeImage;
