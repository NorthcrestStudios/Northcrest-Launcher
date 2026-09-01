/**
 * DONNÉES DE DÉMONSTRATION
 * ------------------------------------------------------------------
 * Cette couche alimente l'interface tant que les backends réels
 * (Firebase / API Northcrest / CDN de patchs) ne sont pas branchés.
 * Elle est volontairement isolée : les pages ne consomment que les
 * stores de src/state — remplacer ces constantes par des fetchs
 * réels ne touche aucun composant UI.
 */

import type {
  Game,
  NewsItem,
  Friend,
  DownloadItem,
  Post,
  Suggestion,
  Contributor,
  Thread,
  Profile,
  CloudSaveEntry,
} from '../types';

export const PROFILE: Profile = {
  name: "",
  email: "",

  role: "OWNER",

  level: 1,

  xp: 0,
  xpNext: 18000,

  nc: 0,

  badges: 0,

  ideasAccepted: 0,

  bugsReported: 0,

  title: "Nouveau membre",

  bio: null,

  avatar: null,

  playtimeHours: 0,

  gamesOwned: 0,
};

export const GAMES: Game[] = [
  {
    id: 'blackbridge',
    title: 'BlackBridge',
    tagline: 'Entropy is yours to control',
    version: '1.2.4',
    status: 'installed',
    playtimeH: 128,
    lastPlayed: "Aujourd'hui",
    sizeGb: 78.3,
    palette: ['#6d5cff', '#1a1030'],
  },
  {
    id: 'aurora',
    title: 'Project Aurora',
    status: 'coming',
    palette: ['#4f7dff', '#0e1a33'],
  },
  {
    id: 'nexus',
    title: 'Nexus Online',
    status: 'dev',
    palette: ['#4fd2ff', '#0b1f2b'],
  },
  {
    id: 'arena',
    title: 'Northcrest Arena',
    status: 'dev',
    palette: ['#ff7a5c', '#2b120b'],
  },
];

export const NEWS: NewsItem[] = [
  {
    id: 'season1',
    kicker: 'Nouveau',
    title: 'Saison 1 — Shattered Order',
    excerpt: 'Découvrez le nouveau pass de combat, les récompenses exclusives et bien plus encore !',
    date: '20 mai 2026',
    comments: 142,
    likes: 987,
    kind: 'season',
    featured: true,
  },
  {
    id: 'maintenance',
    kicker: 'Maintenance prévue',
    title: 'Maintenance des serveurs',
    excerpt: 'Interruption des services le 23 mai à 04:00 CET, durée estimée 2 h.',
    date: '20 mai 2026',
    comments: 31,
    likes: 120,
    kind: 'maintenance',
  },
  {
    id: 'xp-weekend',
    kicker: 'Événement',
    title: 'Week-end x2 XP',
    excerpt: 'Du 24 au 26 mai, toute l’expérience gagnée dans BlackBridge est doublée.',
    date: '19 mai 2026',
    comments: 58,
    likes: 431,
    kind: 'event',
  },
  {
    id: 'patch-124',
    kicker: 'Mise à jour',
    title: 'Patch Notes 1.2.4',
    excerpt: 'Équilibrage de l’Entropy Core, corrections de collision et optimisations GPU.',
    date: '18 mai 2026',
    comments: 76,
    likes: 265,
    kind: 'patch',
  },
];

export const FRIENDS: Friend[] = [
  {
    id: 'f1',
    name: 'ShadowHunter',
    presence: 'ingame',
    activity: 'En jeu — BlackBridge',
    joinable: true,
  },
  {
    id: 'f2',
    name: 'Nova_',
    presence: 'ingame',
    activity: 'En jeu — BlackBridge',
    joinable: true,
  },
  {
    id: 'f3',
    name: 'DarkPhoenix',
    presence: 'online',
    activity: 'En lobby',
  },
  {
    id: 'f4',
    name: 'Kaizen',
    presence: 'ingame',
    activity: 'En jeu — BlackBridge',
    joinable: true,
  },
  {
    id: 'f5',
    name: 'Luna',
    presence: 'ingame',
    activity: 'En jeu — BlackBridge',
    joinable: true,
  },
  {
    id: 'f6',
    name: 'Vex',
    presence: 'away',
    activity: 'Absent',
  },
  {
    id: 'f7',
    name: 'Mirage',
    presence: 'offline',
  },
  {
    id: 'f8',
    name: 'Onyx',
    presence: 'offline',
  },
];

export const INITIAL_DOWNLOADS: DownloadItem[] = [
  {
    id: 'bb-125',
    title: 'BlackBridge',
    subtitle: 'Mise à jour 1.2.5',
    totalGb: 6.21,
    doneGb: 3.82,
    state: 'downloading',
  },
  {
    id: 'tex-hd',
    title: 'Pack Textures HD',
    subtitle: 'Optionnel',
    totalGb: 4.0,
    doneGb: 1.15,
    state: 'downloading',
    optional: true,
  },
  {
    id: 'vf',
    title: 'Voix Françaises',
    subtitle: 'Optionnel',
    totalGb: 1.33,
    doneGb: 0.5,
    state: 'downloading',
    optional: true,
  },
];

export const POSTS: Post[] = [
  {
    id: 'p1',
    author: 'Northcrest Studios',
    isDev: true,
    official: true,
    when: 'Il y a 2 h',
    text: 'La Saison 1 — Shattered Order arrive la semaine prochaine. Nouveau pass, nouveau district, et l’Entropy Surge en événement de lancement. Préparez-vous.',
    media: 'screenshot',
    likes: 1204,
    liked: false,
    shares: 210,
    comments: [
      {
        id: 'c1',
        author: 'Nova_',
        text: 'Le district a l’air immense 🔥',
      },
      {
        id: 'c2',
        author: 'Elyra (Northcrest)',
        isDev: true,
        text: 'Il l’est. Et il se souvient de vos choix.',
      },
    ],
  },
  {
    id: 'p2',
    author: 'ShadowHunter',
    when: 'Il y a 5 h',
    text: 'Clutch en 1v3 sur le pont sud. L’Entropy Shift au bon moment change tout — clip ci-dessous.',
    media: 'clip',
    likes: 342,
    liked: true,
    shares: 41,
    comments: [
      {
        id: 'c3',
        author: 'Kaizen',
        text: 'Le timing du shift 😳',
      },
    ],
  },
  {
    id: 'p3',
    author: 'Luna',
    when: 'Hier',
    text: 'Suggestion : un mode photo avec contrôle du brouillard volumétrique. Le skyline de nuit le mérite.',
    likes: 188,
    liked: false,
    shares: 12,
    comments: [],
  },
];

export const SUGGESTIONS: Suggestion[] = [
  {
    id: 's1',
    author: 'Luna',
    title: 'Mode photo avancé',
    body: 'Contrôle de la profondeur de champ, du brouillard volumétrique et de l’heure. Export 4K.',
    votes: 1842,
    voted: false,
    comments: 96,
    status: 'dev',
  },
  {
    id: 's2',
    author: 'Kaizen',
    title: 'Replays de fin de partie',
    body: 'Revoir les 30 dernières secondes sous plusieurs angles, avec partage direct dans le feed.',
    votes: 1310,
    voted: true,
    comments: 64,
    status: 'etude',
  },
  {
    id: 's3',
    author: 'ShadowHunter',
    title: 'File d’attente inter-régions',
    body: 'Pouvoir grouper avec des amis EU/NA sans changer de compte, avec indicateur de ping.',
    votes: 987,
    voted: false,
    comments: 41,
    status: 'prevu',
  },
  {
    id: 's4',
    author: 'Vex',
    title: 'Daltonisme : palettes d’Entropy',
    body: 'Palettes alternatives pour les effets d’Entropy, difficiles à lire en protanopie.',
    votes: 764,
    voted: false,
    comments: 22,
    status: 'test',
  },
  {
    id: 's5',
    author: 'Nova_',
    title: 'Recalibrage des sensibilités par arme',
    body: 'Un multiplicateur de sensibilité distinct par catégorie d’arme.',
    votes: 512,
    voted: false,
    comments: 18,
    status: 'dispo',
  },
  {
    id: 's6',
    author: 'Mirage',
    title: 'Climat dynamique en Ranked',
    body: 'Activer la météo dynamique dans les parties classées.',
    votes: 203,
    voted: false,
    comments: 9,
    status: 'attente',
  },
];

export const CONTRIBUTORS: Contributor[] = [
  {
    id: 'h1',
    name: 'Luna',
    ideasAccepted: 14,
    badges: 9,
    rewardsNc: 12500,
    tier: 'legende',
  },
  {
    id: 'h2',
    name: 'Kaizen',
    ideasAccepted: 11,
    badges: 7,
    rewardsNc: 9800,
    tier: 'or',
  },
  {
    id: 'h3',
    name: 'Rywan_G',
    ideasAccepted: 8,
    badges: 6,
    rewardsNc: 7200,
    tier: 'or',
  },
  {
    id: 'h4',
    name: 'ShadowHunter',
    ideasAccepted: 5,
    badges: 4,
    rewardsNc: 4100,
    tier: 'argent',
  },
  {
    id: 'h5',
    name: 'DarkPhoenix',
    ideasAccepted: 3,
    badges: 3,
    rewardsNc: 2300,
    tier: 'argent',
  },
  {
    id: 'h6',
    name: 'Vex',
    ideasAccepted: 2,
    badges: 2,
    rewardsNc: 1200,
    tier: 'bronze',
  },
];

export const THREADS: Thread[] = [
  {
    id: 't1',
    with: 'Nova_',
    presence: 'ingame',
    messages: [
      {
        id: 'm1',
        me: false,
        text: 'On lance une session ce soir ?',
        at: '18:02',
      },
      {
        id: 'm2',
        me: true,
        text: 'Oui, après la maj 1.2.5. Elle télécharge.',
        at: '18:04',
      },
      {
        id: 'm3',
        me: false,
        text: 'Parfait, je warm-up en attendant.',
        at: '18:05',
      },
    ],
  },
  {
    id: 't2',
    with: 'Kaizen',
    presence: 'ingame',
    messages: [
      {
        id: 'm4',
        me: false,
        text: 'T’as vu le clip de Shadow ?',
        at: '12:40',
      },
      {
        id: 'm5',
        me: true,
        text: 'Le 1v3 ? Monstrueux.',
        at: '12:47',
      },
    ],
  },
  {
    id: 't3',
    with: 'Luna',
    presence: 'ingame',
    messages: [
      {
        id: 'm6',
        me: false,
        text: 'Ma suggestion est passée « En développement » 🎉',
        at: 'Hier',
      },
      {
        id: 'm7',
        me: true,
        text: 'GG ! Le badge Contributeur arrive.',
        at: 'Hier',
      },
    ],
  },
];

export const CLOUD_SAVES: CloudSaveEntry[] = [
  {
    id: 'cs1',
    game: 'BlackBridge',
    slot: 'Campagne — Emplacement 1',
    sizeMb: 42.7,
    syncedAt: "Aujourd'hui, 14:22",
    state: 'synced',
  },
  {
    id: 'cs2',
    game: 'BlackBridge',
    slot: 'Campagne — Emplacement 2',
    sizeMb: 38.1,
    syncedAt: 'Hier, 22:10',
    state: 'synced',
  },
  {
    id: 'cs3',
    game: 'BlackBridge',
    slot: 'Paramètres & bindings',
    sizeMb: 0.4,
    syncedAt: "Aujourd'hui, 14:22",
    state: 'pending',
  },
];