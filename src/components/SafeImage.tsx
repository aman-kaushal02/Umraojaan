import { useEffect, useState } from 'react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  priority?: boolean;
}

export function SafeImage({
  src,
  alt,
  className = '',
  fallbackLabel = 'Image not available',
  priority = false,
}: SafeImageProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>(
    src ? 'loading' : 'failed'
  );

  useEffect(() => {
    setStatus(src ? 'loading' : 'failed');
  }, [src]);

  if (status === 'failed') {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`relative flex flex-col items-center justify-center gap-4 overflow-hidden bg-white/5 backdrop-blur-sm ${className}`}
      >
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" opacity="0.1"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <svg className="relative w-16 h-16 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="6" y="6" width="36" height="36" rx="2" />
          <circle cx="17" cy="17" r="3" />
          <path d="M6 30 L18 18 L26 26 L42 10 L42 42 L6 42 Z" />
        </svg>
        <span className="relative text-sm text-white/40 tracking-wide">{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {status === 'loading' && (
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/10 to-transparent" />
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
          'w-full h-full object-cover transition-all duration-[1800ms]',
          status === 'ready'
            ? 'opacity-100 blur-0 scale-100'
            : 'opacity-0 blur-lg scale-105',
        ].join(' ')}
      />
    </div>
  );
}
