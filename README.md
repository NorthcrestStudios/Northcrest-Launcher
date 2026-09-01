# Northcrest Launcher 2.0

Launcher officiel de **Northcrest Studios** — Electron + **React 18 + TypeScript** (Vite).
Design premium sombre, accents violet/bleu, glassmorphism léger. Interface en français.

## Démarrage

```bash
npm install
npm run dev     # Vite (HMR) + Electron en mode développement
```

Production locale :

```bash
npm run build   # tsc --noEmit (strict) puis vite build → app/dist
npm start       # build + lance Electron sur app/dist
```

Installeurs :

```bash
npm run pack    # build non packagé (test rapide)
npm run dist    # NSIS / DMG / AppImage
```

## Architecture

```
electron/
  main.js       Processus principal : fenêtre, sécurité (contextIsolation,
                sandbox), menu, préférences persistées (northcrest-settings.json),
                canaux IPC. Points d'extension : auth Firebase, Download/Patch
                Manager, lancement de BlackBridge.exe.
  preload.js    Pont contextBridge → window.northcrest (seule API exposée au renderer).
src/
  config.ts     SHOP_URL (boutique web), réseaux sociaux.
  types.ts      Modèles (Game, NewsItem, Friend, DownloadItem, Post, Suggestion…).
  data/mock.ts  Données de démonstration (feed, amis, hall, saves) — à remplacer
                par les vraies API sans toucher aux composants.
  services/
    downloadManager.ts  Gestion des téléchargements : pause / reprise / annulation,
                        progression en arrière-plan, vitesse, ETA. Progression
                        simulée localement ; le vrai téléchargement différentiel
                        (main process, IPC downloads:progress) se branche ici.
  state/AppState.tsx    Contexte global : profil, NC, téléchargements, toasts,
                        récompense quotidienne (localStorage).
  components/   icons.tsx (SVG), ui.tsx (primitives + art génératif), chrome.tsx
                (barre de titre, sidebar, panneaux Téléchargements/Amis/Profil).
  pages/        core.tsx (Accueil, Jeux, Téléchargements, Actualités) et
                features.tsx (Communauté, Boutique NC, Amis, Messages, Cloud
                Save, Paramètres).
```

## Réel vs simulé (état actuel)

| Fonctionnalité | État |
| --- | --- |
| Fenêtre, contrôles, préférences (dossier, langue, auto-update) | **Réel** — IPC persisté sur disque |
| Ouverture boutique / réseaux sociaux dans le navigateur | **Réel** (`shell.openExternal`) |
| Téléchargements (pause/reprise/annulation, arrière-plan, « Mise à jour prête ») | UX réelle, **progression simulée** — brancher le downloader différentiel dans le main process |
| Récompense quotidienne (+50 NC) | Fonctionnelle en **local** (localStorage) |
| Communauté, amis, messages, hall, cloud save | Interface complète sur **données de démo** (`src/data/mock.ts`) |
| Achats North Credits | Redirigés vers la boutique web (Stripe + Northcrest ID) — configurer `SHOP_URL` dans `src/config.ts` |

## Prévu par l'architecture

Téléchargement différentiel avec reprise et vérification de fichiers (interface
`downloadManager` déjà en place), Cloud Save, notifications, mises à jour du
launcher, multi-jeux (la bibliothèque est déjà pilotée par les données).
