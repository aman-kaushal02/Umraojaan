import { useEffect, useRef } from 'react';

/* ------------------------------------------------------------------ *
 * The finale.
 *
 * A real shower is lopsided — a burst, a lull, then two or three at
 * once — so the spawner works in gusts rather than a steady tick. Each
 * meteor sheds embers that keep drifting after the head has burnt out,
 * and the whole canvas composites additively over the sky.
 * ------------------------------------------------------------------ */

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  width: number;
  life: number;
  maxLife: number;
  warm: boolean;
  shed: number;
}

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  r: number;
  warm: boolean;
}

interface Props {
  active: boolean;
  reducedMotion?: boolean;
}

export function MeteorShower({ active, reducedMotion = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;

    const size = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    size();
    window.addEventListener('resize', size);

    let meteors: Meteor[] = [];
    let embers: Ember[] = [];
    let raf = 0;
    let last = performance.now();
    let gustIn = 400;
    let gustLeft = 0;
    let gustGap = 90;
    let started = false;

    /* Everything falls along one shared radiant, the way a real shower
       does — small angular jitter, not random directions. */
    const radiant = -0.62;

    const spawn = () => {
      const jitter = (Math.random() - 0.5) * 0.34;
      const a = radiant + jitter;
      const speed = (reducedMotion ? 0.4 : 0.9) + Math.random() * 1.35;
      const big = Math.random() < 0.16;
      meteors.push({
        x: -w * 0.15 + Math.random() * w * 1.25,
        y: -h * 0.25 - Math.random() * h * 0.35,
        vx: Math.cos(a) * speed * -1,
        vy: -Math.sin(a) * speed,
        len: (big ? 260 : 110) + Math.random() * (big ? 300 : 190),
        width: big ? 1.8 + Math.random() * 1.6 : 0.7 + Math.random() * 1.1,
        life: 0,
        maxLife: 850 + Math.random() * 900,
        warm: Math.random() < 0.42,
        shed: 0,
      });
    };

    const frame = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (activeRef.current) {
        if (!started) {
          started = true;
          gustIn = 260;
        }
        gustIn -= dt;
        if (gustIn <= 0) {
          if (gustLeft <= 0) {
            gustLeft = 2 + Math.floor(Math.random() * 5);
            gustGap = 70 + Math.random() * 170;
            gustIn = 60;
          } else {
            spawn();
            gustLeft -= 1;
            gustIn = gustLeft > 0 ? gustGap : 500 + Math.random() * 1500;
          }
        }
      }

      ctx.globalCompositeOperation = 'lighter';

      meteors = meteors.filter((m) => {
        m.life += dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        const t = m.life / m.maxLife;
        if (t >= 1 || m.y > h + 240 || m.x < -420 || m.x > w + 420) return false;

        const fade = t < 0.12 ? t / 0.12 : Math.pow(1 - (t - 0.12) / 0.88, 1.4);
        const sp = Math.hypot(m.vx, m.vy) || 1;
        const nx = m.vx / sp;
        const ny = m.vy / sp;
        const tx = m.x - nx * m.len;
        const ty = m.y - ny * m.len;

        const core = m.warm ? '255,236,196' : '235,244,255';
        const tail = m.warm ? '255,168,96' : '150,190,255';

        const grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
        grad.addColorStop(0, `rgba(255,255,255,${(0.95 * fade).toFixed(3)})`);
        grad.addColorStop(0.08, `rgba(${core},${(0.7 * fade).toFixed(3)})`);
        grad.addColorStop(0.4, `rgba(${tail},${(0.22 * fade).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${tail},0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        const hr = 5 + m.width * 5;
        const head = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, hr);
        head.addColorStop(0, `rgba(255,255,255,${(0.95 * fade).toFixed(3)})`);
        head.addColorStop(0.35, `rgba(${core},${(0.4 * fade).toFixed(3)})`);
        head.addColorStop(1, `rgba(${core},0)`);
        ctx.fillStyle = head;
        ctx.beginPath();
        ctx.arc(m.x, m.y, hr, 0, 6.2832);
        ctx.fill();

        /* Embers, only from the bigger ones. */
        m.shed += dt;
        if (m.width > 1.5 && m.shed > 46 && embers.length < 260) {
          m.shed = 0;
          embers.push({
            x: m.x - nx * 8,
            y: m.y - ny * 8,
            vx: (Math.random() - 0.5) * 0.05 + m.vx * 0.12,
            vy: (Math.random() - 0.5) * 0.05 + m.vy * 0.12,
            life: 0,
            maxLife: 700 + Math.random() * 900,
            r: 0.7 + Math.random() * 1.5,
            warm: m.warm,
          });
        }
        return true;
      });

      embers = embers.filter((e) => {
        e.life += dt;
        const t = e.life / e.maxLife;
        if (t >= 1) return false;
        e.x += e.vx * dt;
        e.y += e.vy * dt + dt * 0.005;
        const a = (1 - t) * 0.6;
        const rgb = e.warm ? '255,214,160' : '210,228,255';
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 3);
        g.addColorStop(0, `rgba(${rgb},${a.toFixed(3)})`);
        g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 3, 0, 6.2832);
        ctx.fill();
        return true;
      });

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
    };
  }, [reducedMotion]);

  return (
    <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-30" aria-hidden="true" />
  );
}
