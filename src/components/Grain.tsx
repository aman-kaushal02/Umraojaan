/**
 * A fixed film-grain and vignette pass over the whole page.
 *
 * Rendered once, above every scene. The grain is a static SVG turbulence
 * texture rather than an animated canvas, so it costs nothing per frame but
 * still removes the flat, too-clean look of pure CSS gradients.
 */
export function Grain() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[45]">
      {/* Grain */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.055] mix-blend-overlay">
        <filter id="grain-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-noise)" />
      </svg>

      {/* Vignette: keeps attention centre-frame. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 100% at 50% 42%, transparent 42%, rgba(11,7,16,0.42) 100%)',
        }}
      />

      {/* A faint warm bloom along the top edge, like light entering a room. */}
      <div
        className="absolute inset-x-0 top-0 h-40"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,226,184,0.07), transparent)',
        }}
      />
    </div>
  );
}
