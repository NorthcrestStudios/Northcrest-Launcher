/**
 * DownloadManager — gestionnaire de téléchargements du launcher.
 * ------------------------------------------------------------------
 * L'UI (pages + panneau latéral) ne connaît que cette interface :
 * subscribe / pause / resume / cancel / list. La progression est
 * aujourd'hui SIMULÉE localement (aucun réseau) afin que toute la
 * chaîne UX — arrière-plan, pause, reprise, annulation, vitesse,
 * temps restant, bannière « Mise à jour prête » — soit fonctionnelle.
 *
 * BRANCHEMENT RÉEL (main process) :
 *  - le vrai téléchargement différentiel vivra dans electron/main.js
 *    (téléchargement de manifestes, diff des chunks, hash-check,
 *    reprise après interruption via Range requests) ;
 *  - il publiera les mêmes événements de progression via IPC
 *    (`downloads:progress`) ; il suffira de remplacer le `tick()`
 *    ci-dessous par un `ipcRenderer.on` relayé dans preload.js —
 *    l'interface ne change pas d'une ligne.
 */

import type { DownloadItem } from '../types';
import { INITIAL_DOWNLOADS } from '../data/mock';

export type DownloadsListener = (items: DownloadItem[], speedMBs: number) => void;

const TICK_MS = 500;
/** Débit simulé global (Mo/s), légèrement variable pour le réalisme. */
const BASE_SPEED_MBS = 24.6;

class DownloadManager {
  private items: DownloadItem[] = INITIAL_DOWNLOADS.map((d) => ({ ...d }));
  private listeners = new Set<DownloadsListener>();
  private timer: number | null = null;
  private speed = BASE_SPEED_MBS;

  constructor() {
    this.start();
  }

  subscribe(fn: DownloadsListener): () => void {
    this.listeners.add(fn);
    fn(this.snapshot(), this.currentSpeed());
    return () => this.listeners.delete(fn);
  }

  list(): DownloadItem[] { return this.snapshot(); }

  pause(id: string): void { this.setState(id, 'paused'); }
  resume(id: string): void { this.setState(id, 'downloading'); }
  cancel(id: string): void { this.setState(id, 'cancelled'); }

  /** Vitesse agrégée courante (0 si tout est en pause/terminé). */
  currentSpeed(): number {
    return this.items.some((d) => d.state === 'downloading') ? this.speed : 0;
  }

  /** Estimation du temps restant total, en secondes. */
  etaSeconds(): number {
    const remainingGb = this.items
      .filter((d) => d.state === 'downloading')
      .reduce((sum, d) => sum + (d.totalGb - d.doneGb), 0);
    const speed = this.currentSpeed();
    if (speed <= 0) return 0;
    return Math.max(1, Math.round((remainingGb * 1024) / speed));
  }

  // ----------------------------------------------------------------
  private setState(id: string, state: DownloadItem['state']): void {
    this.items = this.items.map((d) => (d.id === id ? { ...d, state } : d));
    this.emit();
  }

  private start(): void {
    if (this.timer !== null) return;
    this.timer = window.setInterval(() => this.tick(), TICK_MS);
  }

  /** ⇦ Point remplacé par les événements IPC du vrai downloader. */
  private tick(): void {
    const active = this.items.filter((d) => d.state === 'downloading');
    if (active.length === 0) return;

    // Débit qui respire un peu (±12 %)
    this.speed = Math.max(4, BASE_SPEED_MBS * (0.88 + Math.random() * 0.24));
    const perItemGb = (this.speed / 1024) * (TICK_MS / 1000) / active.length;

    this.items = this.items.map((d) => {
      if (d.state !== 'downloading') return d;
      const doneGb = Math.min(d.totalGb, d.doneGb + perItemGb);
      return { ...d, doneGb, state: doneGb >= d.totalGb ? 'done' : 'downloading' };
    });
    this.emit();
  }

  private snapshot(): DownloadItem[] {
    return this.items.filter((d) => d.state !== 'cancelled').map((d) => ({ ...d }));
  }

  private emit(): void {
    const snap = this.snapshot();
    const speed = this.currentSpeed();
    this.listeners.forEach((fn) => fn(snap, speed));
  }
}

/** Singleton applicatif : la progression continue en arrière-plan,
 *  quelle que soit la page affichée. */
export const downloadManager = new DownloadManager();

export function formatEta(totalSeconds: number): string {
  if (totalSeconds <= 0) return '—';
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return m > 0 ? `${m}m ${s.toString().padStart(2, '0')}s` : `${s}s`;
}
