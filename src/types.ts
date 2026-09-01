/* Modèles de données du launcher. */


export type PageId =
  | 'home'
  | 'games'
  | 'downloads'
  | 'news'
  | 'community'
  | 'store'
  | 'marketplace'
  | 'friends'
  | 'messages'
  | 'profile'
  | 'cloud'
  | 'settings'
  | 'account'
  | 'achievements'
  | 'creator';


export type GameStatus =
  | 'installed'
  | 'update'
  | 'coming'
  | 'dev';


export interface Game {
  id: string;

  title: string;

  tagline?: string;

  version?: string;

  status: GameStatus;

  playtimeH?: number;

  lastPlayed?: string;

  sizeGb?: number;

  palette: [string, string];
}


export interface NewsItem {
  id: string;

  kicker: string;

  title: string;

  excerpt: string;

  date: string;

  comments: number;

  likes: number;

  kind:
    | 'season'
    | 'maintenance'
    | 'event'
    | 'patch';

  featured?: boolean;
}


/*
 * ==========================================================
 * PRESENCE
 * ==========================================================
 */

export type PresenceStatus =
  | 'online'
  | 'away'
  | 'dnd'
  | 'invisible'
  | 'offline'
  | 'ingame';

export type Presence = PresenceStatus;


/*
 * ==========================================================
 * FRIENDS
 * ==========================================================
 */

export interface Friend {
  /*
   * Identité Northcrest
   */

  id: string;

  name: string;

  avatar?: string | null;


  /*
   * Présence réelle venant du backend
   */

  presence: PresenceStatus;

  activity?: string;

  gameId?: string | null;

  gameName?: string | null;

  sessionId?: string | null;

  lastSeenAt?: string | null;


  /*
   * Session actuelle.
   *
   * Utilisée notamment pour le bouton
   * "Rejoindre".
   */

  joinable?: boolean;
}


/*
 * ==========================================================
 * FRIEND REQUEST
 * ==========================================================
 */

export type FriendRequestStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'cancelled';


export interface FriendRequest {
  id: string;

  accountId: string;

  accountName: string;

  accountAvatar?: string | null;

  status: FriendRequestStatus;

  createdAt: string;
}


/*
 * ==========================================================
 * DOWNLOADS
 * ==========================================================
 */

export interface DownloadItem {
  id: string;

  title: string;

  subtitle: string;

  totalGb: number;

  doneGb: number;

  state:
    | 'downloading'
    | 'paused'
    | 'done'
    | 'cancelled';

  optional?: boolean;
}


/*
 * ==========================================================
 * COMMUNITY
 * ==========================================================
 */

export interface Post {
  id: string;

  author: string;

  isDev?: boolean;

  official?: boolean;

  when: string;

  text: string;

  media?:
    | 'screenshot'
    | 'clip';

  likes: number;

  liked: boolean;

  shares: number;

  comments: PostComment[];
}


export interface PostComment {
  id: string;

  author: string;

  isDev?: boolean;

  text: string;
}


/*
 * ==========================================================
 * SUGGESTIONS
 * ==========================================================
 */

export type SuggestionStatus =
  | 'attente'
  | 'etude'
  | 'prevu'
  | 'dev'
  | 'test'
  | 'dispo';


export interface Suggestion {
  id: string;

  author: string;

  title: string;

  body: string;

  votes: number;

  voted: boolean;

  comments: number;

  status: SuggestionStatus;
}


/*
 * ==========================================================
 * CONTRIBUTORS
 * ==========================================================
 */

export type Tier =
  | 'legende'
  | 'or'
  | 'argent'
  | 'bronze';


export interface Contributor {
  id: string;

  name: string;

  ideasAccepted: number;

  badges: number;

  rewardsNc: number;

  tier: Tier;
}


/*
 * ==========================================================
 * MESSAGES
 * ==========================================================
 */

export interface Thread {
  id: string;

  with: string;

  presence: PresenceStatus;

  messages: ChatMessage[];
}


export interface ChatMessage {
  id: string;

  me: boolean;

  text: string;

  at: string;
}


/*
 * ==========================================================
 * PROFILE
 * ==========================================================
 */

export interface Profile {
  name: string;

  email: string;


  level: number;

  xp: number;

  xpNext: number;


  nc: number;


  badges: number;


  ideasAccepted: number;


  bugsReported: number;


  title: string;


  bio: string | null;


  avatar: string | null;


  playtimeHours: number;


  gamesOwned: number;


  role:
    | 'USER'
    | 'MODERATOR'
    | 'ADMIN'
    | 'OWNER'
    | 'SYSTEM';
}


/*
 * ==========================================================
 * CLOUD SAVE
 * ==========================================================
 */

export interface CloudSaveEntry {
  id: string;

  game: string;

  slot: string;

  sizeMb: number;

  syncedAt: string;

  state:
    | 'synced'
    | 'pending';
}