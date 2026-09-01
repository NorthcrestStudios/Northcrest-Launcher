/** Primitives UI réutilisables + art génératif (aucun asset binaire). */

import type { ReactNode } from 'react';
import type { Presence } from '../types';

/* ------------------------------------------------------------------
   Primitives
   ------------------------------------------------------------------ */
export function Card({ children, className = '', pad = true, hover = false }: {
  children: ReactNode; className?: string; pad?: boolean; hover?: boolean;
}) {
  return (
    <div className={`card ${pad ? 'card-pad' : ''} ${hover ? 'card-hover' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function SectionHead({ title, action, onAction }: {
  title: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className="sect-head">
      <h2 className="sect-title">{title}</h2>
      {action && <button className="sect-link" onClick={onAction}>{action}</button>}
    </div>
  );
}

export function Avatar({ name, src, size = 38, round = false, presence }: {
  name: string; src?: string | null; size?: number; round?: boolean; presence?: Presence;
}) {
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 70;
  return (
    <div
      className={`avatar ${round ? 'round' : ''}`}
      style={{
        width: size, height: size, fontSize: size * 0.42,
        background: `linear-gradient(140deg, hsl(${250 + hue} 80% 62%), hsl(${215 + hue} 75% 50%))`,
      }}
    >
      {src ? <img src={src} alt="" /> : name.charAt(0).toUpperCase()}
      {presence && <span className={`presence status-dot ${presence}`} />}
    </div>
  );
}

export function Progress({ value, paused = false, thin = false }: {
  value: number; paused?: boolean; thin?: boolean;
}) {
  return (
    <div className={`progress ${thin ? 'thin' : ''}`}>
      <span className={paused ? 'paused' : ''} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

export const PRESENCE_LABEL: Record<Presence, string> = {
  ingame: 'En jeu', online: 'En ligne', away: 'Absent', offline: 'Hors ligne',
};

/* ------------------------------------------------------------------
   Pièce NC
   ------------------------------------------------------------------ */
export function NcCoin({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="pack-coin" style={{ display: 'inline-block' }}>
      <circle cx="32" cy="32" r="29" fill="url(#ncc)" />
      <circle cx="32" cy="32" r="29" fill="none" stroke="#4a3fb0" strokeWidth="3" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="#4a3fb0" strokeWidth="1.6" opacity=".7" />
      <path d="M20 42V22l12 13 12-13v20" fill="none" stroke="#14102b" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="ncc" x1="0" y1="0" x2="64" y2="64">
          <stop stopColor="#a58cff" /><stop offset="1" stopColor="#6d5cff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------
   Art génératif — hero BlackBridge (skyline + portail d'Entropy)
   ------------------------------------------------------------------ */
export function BlackBridgeArt({ className = 'hero-art' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#0b0a1a" /><stop offset=".6" stopColor="#171238" /><stop offset="1" stopColor="#0b0a18" />
        </linearGradient>
        <radialGradient id="bb-portal" cx=".5" cy=".5" r=".5">
          <stop stopColor="#c9b8ff" /><stop offset=".35" stopColor="#8a6bff" stopOpacity=".85" />
          <stop offset=".7" stopColor="#5a3fd6" stopOpacity=".35" /><stop offset="1" stopColor="#5a3fd6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bb-city" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#191536" /><stop offset="1" stopColor="#0c0b1c" />
        </linearGradient>
      </defs>
      <rect width="1200" height="520" fill="url(#bb-sky)" />
      {/* Portail */}
      <circle cx="860" cy="170" r="150" fill="url(#bb-portal)" />
      <circle cx="860" cy="170" r="96" fill="none" stroke="#b9a4ff" strokeWidth="2.5" opacity=".8" />
      <circle cx="860" cy="170" r="118" fill="none" stroke="#8a6bff" strokeWidth="1.4" opacity=".5" strokeDasharray="6 10" />
      {/* Débris orbitaux */}
      {[
        [700, 70, 10], [980, 90, 14], [1030, 220, 9], [740, 250, 7], [920, 40, 6],
      ].map(([x, y, r], i) => (
        <rect key={i} x={x} y={y} width={r * 2} height={r * 2} rx={3}
          fill="#221c48" stroke="#6d5cff" strokeWidth="1" opacity=".8"
          transform={`rotate(${20 + i * 25} ${x} ${y})`} />
      ))}
      {/* Skyline arrière */}
      <g fill="url(#bb-city)">
        {[
          [0, 300, 90, 220], [110, 260, 70, 260], [200, 320, 110, 200], [330, 240, 80, 280],
          [430, 300, 95, 220], [545, 210, 90, 310], [655, 290, 75, 230], [750, 330, 100, 190],
          [870, 300, 85, 220], [975, 250, 95, 270], [1090, 310, 110, 210],
        ].map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} />)}
      </g>
      {/* Fenêtres */}
      <g fill="#8a6bff" opacity=".55">
        {[
          [130, 290], [148, 320], [352, 275], [366, 300], [560, 240], [578, 268], [596, 240],
          [995, 280], [1012, 305], [455, 320], [782, 350], [905, 330],
        ].map(([x, y], i) => <rect key={i} x={x} y={y} width="6" height="9" rx="1" />)}
      </g>
      {/* Silhouette (dos, capuche) */}
      <g transform="translate(600 250)">
        <path d="M0 270 V150 q0 -34 26 -46 q-12 -10 -12 -26 a30 30 0 0 1 60 0 q0 16 -12 26 q26 12 26 46 V270 Z"
          fill="#08070f" transform="translate(-44 0)" />
        <circle cx="0" cy="180" r="13" fill="none" stroke="#8a6bff" strokeWidth="2.4" opacity=".95" />
        <path d="M0 168 l4 8 h-8 Z M0 192 l4 -8 h-8 Z" fill="#8a6bff" opacity=".95" />
      </g>
      {/* Sol / pont */}
      <rect y="470" width="1200" height="50" fill="#070610" />
      <path d="M0 470 H1200" stroke="#6d5cff" strokeWidth="1.4" opacity=".45" />
    </svg>
  );
}

/** Cover générative pour la grille de jeux. */
export function GameCoverArt({ palette, seed }: { palette: [string, string]; seed: string }) {
  const n = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const peaks = Array.from({ length: 6 }, (_, i) => {
    const x = i * 80;
    const y = 60 + ((n * (i + 3)) % 70);
    return `L${x} ${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`gc-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={palette[1]} /><stop offset="1" stopColor="#08070f" />
        </linearGradient>
        <radialGradient id={`gg-${seed}`} cx=".75" cy=".2" r=".7">
          <stop stopColor={palette[0]} stopOpacity=".55" /><stop offset="1" stopOpacity="0" stopColor={palette[0]} />
        </radialGradient>
      </defs>
      <rect width="400" height="150" fill={`url(#gc-${seed})`} />
      <rect width="400" height="150" fill={`url(#gg-${seed})`} />
      <circle cx="300" cy="45" r="26" fill="none" stroke={palette[0]} strokeWidth="2" opacity=".85" />
      <path d={`M0 150 L0 110 ${peaks} L400 95 L400 150 Z`} fill="#0a0918" opacity=".9" />
      <path d={`M0 110 ${peaks} L400 95`} fill="none" stroke={palette[0]} strokeWidth="1.3" opacity=".5" />
    </svg>
  );
}

/** Visuel pour les cartes de news / médias de posts. */
export function NewsArt({ kind, tall = false }: { kind: string; tall?: boolean }) {
  const palettes: Record<string, [string, string]> = {
    season: ['#6d5cff', '#1a1238'], maintenance: ['#4f7dff', '#0d1830'],
    event: ['#9d7bff', '#221345'], patch: ['#4fd2ff', '#0b2030'],
    screenshot: ['#6d5cff', '#151033'], clip: ['#ff7a5c', '#2a1410'],
  };
  const [a, b] = palettes[kind] ?? palettes.season;
  const h = tall ? 300 : 200;
  return (
    <svg viewBox={`0 0 600 ${h}`} preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id={`na-${kind}-${h}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={b} /><stop offset="1" stopColor="#08070f" />
        </linearGradient>
      </defs>
      <rect width="600" height={h} fill={`url(#na-${kind}-${h})`} />
      <circle cx="470" cy={h * 0.32} r={h * 0.3} fill={a} opacity=".18" />
      <circle cx="470" cy={h * 0.32} r={h * 0.19} fill="none" stroke={a} strokeWidth="2" opacity=".7" />
      <path d={`M0 ${h * 0.86} L110 ${h * 0.55} L210 ${h * 0.74} L330 ${h * 0.45} L450 ${h * 0.7} L600 ${h * 0.52}`}
        fill="none" stroke={a} strokeWidth="1.6" opacity=".55" />
      <path d={`M0 ${h} L0 ${h * 0.86} L110 ${h * 0.55} L210 ${h * 0.74} L330 ${h * 0.45} L450 ${h * 0.7} L600 ${h * 0.52} L600 ${h} Z`}
        fill="#0a0918" opacity=".85" />
      {kind === 'clip' && (
        <g>
          <circle cx="300" cy={h / 2 - 8} r="26" fill="rgba(8,7,15,.7)" stroke={a} strokeWidth="2" />
          <path d={`M292 ${h / 2 - 20} v24 l20 -12 Z`} fill={a} />
        </g>
      )}
    </svg>
  );
}
