/** Icônes SVG (trait fin, 24×24) — aucune dépendance externe. */

interface P { size?: number }
const S = (size?: number) => ({
  width: size ?? 18, height: size ?? 18,
  viewBox: '0 0 24 24', fill: 'none' as const,
  stroke: 'currentColor', strokeWidth: 1.7,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
});

export const IcHome = ({ size }: P) => (
  <svg {...S(size)}><path d="M3 11 12 4l9 7v9h-6v-6h-6v6H3Z" /></svg>
);
export const IcGames = ({ size }: P) => (
  <svg {...S(size)}><rect x="2.5" y="7" width="19" height="11" rx="4.5" /><path d="M8 11v3M6.5 12.5h3M15.5 11.5h.01M17.8 13.6h.01" /></svg>
);
export const IcDownload = ({ size }: P) => (
  <svg {...S(size)}><path d="M12 4v10m0 0 4-4m-4 4-4-4M4 19h16" /></svg>
);
export const IcNews = ({ size }: P) => (
  <svg {...S(size)}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 9h8M8 13h8M8 17h5" /></svg>
);
export const IcCommunity = ({ size }: P) => (
  <svg {...S(size)}><circle cx="9" cy="9" r="3.2" /><path d="M3.5 19c.6-3 3-4.5 5.5-4.5S13.9 16 14.5 19" /><circle cx="17" cy="8" r="2.4" /><path d="M15.4 13.6c2.7-.3 4.7 1.1 5.2 3.9" /></svg>
);
export const IcStore = ({ size }: P) => (
  <svg {...S(size)}><path d="M4 8h16l-1.2 11.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 8Z" /><path d="M8.5 11V6.5a3.5 3.5 0 0 1 7 0V11" /></svg>
);
export const IcFriends = ({ size }: P) => (
  <svg {...S(size)}><circle cx="12" cy="8.5" r="3.4" /><path d="M4.5 20c.8-3.6 3.9-5.4 7.5-5.4s6.7 1.8 7.5 5.4" /></svg>
);
export const IcMessages = ({ size }: P) => (
  <svg {...S(size)}><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H9l-4.4 3.4c-.3.2-.6 0-.6-.3V6.5Z" /></svg>
);
export const IcCloud = ({ size }: P) => (
  <svg {...S(size)}><path d="M7 18a4 4 0 0 1-.6-8A5.4 5.4 0 0 1 17 8.6 3.8 3.8 0 0 1 17.4 18H7Z" /></svg>
);
export const IcSettings = ({ size }: P) => (
  <svg {...S(size)}><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2.4M12 18.1v2.4M3.5 12h2.4M18.1 12h2.4M6 6l1.7 1.7M16.3 16.3 18 18M18 6l-1.7 1.7M7.7 16.3 6 18" /></svg>
);
export const IcSearch = ({ size }: P) => (
  <svg {...S(size)}><circle cx="11" cy="11" r="6.2" /><path d="m20 20-4.2-4.2" /></svg>
);
export const IcBell = ({ size }: P) => (
  <svg {...S(size)}><path d="M6 16v-5a6 6 0 1 1 12 0v5l1.6 2.4H4.4L6 16Z" /><path d="M10 20.5a2.2 2.2 0 0 0 4 0" /></svg>
);
export const IcPlay = ({ size }: P) => (
  <svg {...S(size)} fill="currentColor" stroke="none"><path d="M8 5.5v13l11-6.5L8 5.5Z" /></svg>
);
export const IcPause = ({ size }: P) => (
  <svg {...S(size)}><path d="M9 5.5v13M15 5.5v13" /></svg>
);
export const IcResume = ({ size }: P) => (
  <svg {...S(size)}><path d="M8.5 5.5v13l10-6.5-10-6.5Z" /></svg>
);
export const IcClose = ({ size }: P) => (
  <svg {...S(size)}><path d="m6 6 12 12M18 6 6 18" /></svg>
);
export const IcChevron = ({ size }: P) => (
  <svg {...S(size)}><path d="m9 6 6 6-6 6" /></svg>
);
export const IcHeart = ({ size, filled }: P & { filled?: boolean }) => (
  <svg {...S(size)} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7.5-4.6-9.3-9A5 5 0 0 1 12 7a5 5 0 0 1 9.3 4c-1.8 4.4-9.3 9-9.3 9Z" />
  </svg>
);
export const IcComment = ({ size }: P) => (
  <svg {...S(size)}><path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.4-4.9A7.5 7.5 0 1 1 20 11.5Z" /></svg>
);
export const IcShare = ({ size }: P) => (
  <svg {...S(size)}><circle cx="6" cy="12" r="2.4" /><circle cx="18" cy="6" r="2.4" /><circle cx="18" cy="18" r="2.4" /><path d="m8.2 10.9 7.6-3.8M8.2 13.1l7.6 3.8" /></svg>
);
export const IcArrowUp = ({ size }: P) => (
  <svg {...S(size)}><path d="M12 19V5m0 0-6 6m6-6 6 6" /></svg>
);
export const IcCheck = ({ size }: P) => (
  <svg {...S(size)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const IcGift = ({ size }: P) => (
  <svg {...S(size)}><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M4 13h16M12 10v10M12 10s-4 .2-4.8-2A2 2 0 0 1 10 5.4c1.8.6 2 4.6 2 4.6s.2-4 2-4.6A2 2 0 0 1 16.8 8c-.8 2.2-4.8 2-4.8 2Z" /></svg>
);
export const IcFolder = ({ size }: P) => (
  <svg {...S(size)}><path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2.5h6a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17V7.5Z" /></svg>
);
export const IcRefresh = ({ size }: P) => (
  <svg {...S(size)}><path d="M4.5 12a7.5 7.5 0 0 1 13-5.1L20 9.5M20 5v4.5h-4.5M19.5 12a7.5 7.5 0 0 1-13 5.1L4 14.5M4 19v-4.5h4.5" /></svg>
);
export const IcCamera = ({ size }: P) => (
  <svg {...S(size)}><rect x="3.5" y="7" width="17" height="12.5" rx="2.5" /><path d="M8.5 7 10 4.5h4L15.5 7" /><circle cx="12" cy="13" r="3.2" /></svg>
);
export const IcVideo = ({ size }: P) => (
  <svg {...S(size)}><rect x="3.5" y="6.5" width="12.5" height="11" rx="2.5" /><path d="m16 11 4.5-2.8v7.6L16 13" /></svg>
);
export const IcLogo = ({ size = 26 }: P) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="16" fill="url(#nclg)" />
    <path d="M18 44V20l14 15 14-15v24" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="nclg" x1="0" y1="0" x2="64" y2="64">
        <stop stopColor="#6d5cff" /><stop offset="1" stopColor="#3d3480" />
      </linearGradient>
    </defs>
  </svg>
);
export const IcDiscord = ({ size }: P) => (
  <svg {...S(size)}><path d="M8.5 17c-2.5-.6-4-2-4-2 .3-4 1.4-6.6 2.6-8.2C8.4 6 10 5.6 10 5.6l.5 1.2a12 12 0 0 1 3 0L14 5.6s1.6.4 2.9 1.2c1.2 1.6 2.3 4.2 2.6 8.2 0 0-1.5 1.4-4 2l-.9-1.5c.9-.3 1.9-.9 1.9-.9-2.7 1.4-6.3 1.4-9 0 0 0 1 .6 1.9.9L8.5 17Z" /><path d="M9.7 12.4h.01M14.3 12.4h.01" strokeWidth="2.4" /></svg>
);
export const IcYoutube = ({ size }: P) => (
  <svg {...S(size)}><rect x="3" y="6.5" width="18" height="11" rx="3.5" /><path d="M10.5 10v4l3.6-2-3.6-2Z" fill="currentColor" stroke="none" /></svg>
);
export const IcX = ({ size }: P) => (
  <svg {...S(size)}><path d="M5 5l14 14M19 5 5 19" /></svg>
);
export const IcInstagram = ({ size }: P) => (
  <svg {...S(size)}><rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="12" cy="12" r="3.6" /><path d="M16.8 7.2h.01" strokeWidth="2.4" /></svg>
);
