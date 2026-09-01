'use strict';

/**
 * Northcrest Launcher — Processus principal Electron
 *
 * Gère :
 * - la fenêtre principale
 * - les préférences utilisateur
 * - les canaux IPC
 * - le lancement de BlackBridge
 * - la sécurité Electron
 * - les mises à jour automatiques du Launcher
 */

const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  shell,
  dialog,
  nativeTheme
} = require('electron');

const path = require('path');
const os = require('os');
const fs = require('fs');
const { spawn } = require('child_process');
const { autoUpdater } = require('electron-updater');


/* ============================================================================
 * CONSTANTES
 * ========================================================================== */

const IS_DEV = process.argv.includes('--dev');
const IS_MAC = process.platform === 'darwin';
const IS_WINDOWS = process.platform === 'win32';

const APP_ROOT = path.join(__dirname, '..');

const RENDERER_ENTRY = path.join(
  APP_ROOT,
  'app',
  'dist',
  'index.html'
);

const DEV_SERVER_URL = 'http://localhost:5173';

const PRELOAD_SCRIPT = path.join(
  __dirname,
  'preload.js'
);

const MIN_WINDOW_WIDTH = 1180;
const MIN_WINDOW_HEIGHT = 720;


/* ============================================================================
 * DONNÉES UTILISATEUR
 * ========================================================================== */

const USER_DATA_DIR = app.getPath('userData');

const SETTINGS_FILE = path.join(
  USER_DATA_DIR,
  'northcrest-settings.json'
);


/* ============================================================================
 * CONFIGURATION PAR DÉFAUT
 * ========================================================================== */

const DEFAULT_SETTINGS = {
  theme: 'dark',

  language: 'fr-FR',

  downloadFolder: path.join(
    os.homedir(),
    'Northcrest Games'
  ),

  autoUpdateGames: true,

  autoUpdateLauncher: true,

  displayMode: 'windowed'
};


/* ============================================================================
 * ÉTAT GLOBAL
 * ========================================================================== */

/** @type {BrowserWindow | null} */
let mainWindow = null;

let currentSettings = {
  ...DEFAULT_SETTINGS
};


/* ============================================================================
 * UTILITAIRES
 * ========================================================================== */

function ensureUserDataDir() {
  try {
    if (!fs.existsSync(USER_DATA_DIR)) {
      fs.mkdirSync(USER_DATA_DIR, {
        recursive: true
      });
    }
  } catch (error) {
    console.error(
      '[Northcrest] Impossible de créer le dossier utilisateur.',
      error
    );
  }
}


function loadSettings() {
  try {
    ensureUserDataDir();

    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(
        SETTINGS_FILE,
        'utf-8'
      );

      const parsed = JSON.parse(raw);

      return {
        ...DEFAULT_SETTINGS,
        ...parsed
      };
    }
  } catch (error) {
    console.error(
      '[Northcrest] Impossible de lire les préférences.',
      error
    );
  }

  return {
    ...DEFAULT_SETTINGS
  };
}


function saveSettings(settings) {
  try {
    ensureUserDataDir();

    fs.writeFileSync(
      SETTINGS_FILE,
      JSON.stringify(
        settings,
        null,
        2
      ),
      'utf-8'
    );

    return true;
  } catch (error) {
    console.error(
      '[Northcrest] Impossible d’enregistrer les préférences.',
      error
    );

    return false;
  }
}


function isExternalUrl(url) {
  return /^https?:\/\//i.test(url);
}


/* ============================================================================
 * BLACKBRIDGE
 * ========================================================================== */

/**
 * Build Unreal local de développement.
 */
const DEVELOPMENT_GAME_DIRECTORY =
  'C:\\Users\\stan4\\OneDrive\\Documents\\Unreal Projects\\GothamCity 5.7\\Saved\\NorthcrestBuilds\\Development\\Windows';


function getBlackBridgeDirectory() {
  if (IS_DEV) {
    return DEVELOPMENT_GAME_DIRECTORY;
  }

  return path.join(
    currentSettings.downloadFolder,
    'BlackBridge'
  );
}


function getBlackBridgeExecutable() {
  return path.join(
    getBlackBridgeDirectory(),
    'Northcrest.exe'
  );
}


function isBlackBridgeInstalled() {
  return fs.existsSync(
    getBlackBridgeExecutable()
  );
}


/* ============================================================================
 * LAUNCH TICKET
 * ========================================================================== */

function isValidLaunchCode(launchCode) {
  if (typeof launchCode !== 'string') {
    return false;
  }

  return /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(
    launchCode
  );
}


/* ============================================================================
 * MISES À JOUR AUTOMATIQUES
 * ========================================================================== */

/**
 * Configure electron-updater.
 *
 * En production :
 * - recherche automatiquement les mises à jour
 * - télécharge automatiquement la nouvelle version
 * - installe la nouvelle version au prochain redémarrage
 *
 * En développement :
 * - aucune recherche de mise à jour
 */
function setupAutoUpdater() {
  if (IS_DEV) {
    console.log(
      '[Northcrest] Mise à jour automatique désactivée en développement.'
    );

    return;
  }

  if (!currentSettings.autoUpdateLauncher) {
    console.log(
      '[Northcrest] Mise à jour automatique désactivée dans les paramètres.'
    );

    return;
  }

  /**
   * Téléchargement automatique.
   */
  autoUpdater.autoDownload = true;

  /**
   * Installation automatique au prochain lancement.
   */
  autoUpdater.autoInstallOnAppQuit = true;

  /**
   * Évite que l'application soit redémarrée
   * automatiquement sans contrôle explicite.
   */
  autoUpdater.autoRunAppAfterInstall = true;

  /**
   * Logs.
   */
  autoUpdater.on(
    'checking-for-update',
    () => {
      console.log(
        '[Northcrest] Recherche de mise à jour...'
      );
    }
  );

  autoUpdater.on(
    'update-available',
    (info) => {
      console.log(
        '[Northcrest] Mise à jour disponible :',
        info.version
      );

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(
          'updater:update-available',
          {
            version: info.version
          }
        );
      }
    }
  );

  autoUpdater.on(
    'update-not-available',
    (info) => {
      console.log(
        '[Northcrest] Launcher déjà à jour :',
        info.version
      );
    }
  );

  autoUpdater.on(
    'download-progress',
    (progress) => {
      console.log(
        `[Northcrest] Téléchargement mise à jour : ${progress.percent.toFixed(1)}%`
      );

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(
          'updater:download-progress',
          {
            percent: progress.percent,
            transferred: progress.transferred,
            total: progress.total,
            bytesPerSecond: progress.bytesPerSecond
          }
        );
      }
    }
  );

  autoUpdater.on(
    'update-downloaded',
    (info) => {
      console.log(
        '[Northcrest] Mise à jour téléchargée :',
        info.version
      );

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(
          'updater:update-downloaded',
          {
            version: info.version
          }
        );
      }

      /**
       * La mise à jour sera installée automatiquement
       * lorsque l'utilisateur quittera le Launcher.
       */
    }
  );

  autoUpdater.on(
    'error',
    (error) => {
      console.error(
        '[Northcrest] Erreur de mise à jour :',
        error
      );

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(
          'updater:error',
          {
            message:
              error?.message ??
              'Erreur inconnue pendant la mise à jour.'
          }
        );
      }
    }
  );

  /**
   * Recherche après le démarrage du Launcher.
   *
   * Le délai évite de lancer la vérification
   * pendant le chargement initial de l'application.
   */
  setTimeout(
    () => {
      autoUpdater
        .checkForUpdates()
        .catch(
          (error) => {
            console.error(
              '[Northcrest] Impossible de vérifier les mises à jour.',
              error
            );
          }
        );
    },
    5000
  );
}


/**
 * Vérification manuelle d'une mise à jour.
 */
async function checkForUpdates() {
  if (IS_DEV) {
    return {
      success: false,
      reason: 'development'
    };
  }

  if (!currentSettings.autoUpdateLauncher) {
    return {
      success: false,
      reason: 'disabled'
    };
  }

  try {
    const result =
      await autoUpdater.checkForUpdates();

    return {
      success: true,
      updateAvailable:
        Boolean(result?.updateInfo)
    };
  } catch (error) {
    console.error(
      '[Northcrest] Vérification manuelle échouée.',
      error
    );

    return {
      success: false,
      reason: 'error',
      message:
        error?.message ??
        'Impossible de vérifier les mises à jour.'
    };
  }
}


/**
 * Installe immédiatement une mise à jour déjà téléchargée.
 */
function installUpdate() {
  if (IS_DEV) {
    return false;
  }

  try {
    autoUpdater.quitAndInstall(
      false,
      true
    );

    return true;
  } catch (error) {
    console.error(
      '[Northcrest] Impossible d’installer la mise à jour.',
      error
    );

    return false;
  }
}


/* ============================================================================
 * FENÊTRE PRINCIPALE
 * ========================================================================== */

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,

    height: 900,

    minWidth: MIN_WINDOW_WIDTH,

    minHeight: MIN_WINDOW_HEIGHT,

    show: false,

    backgroundColor: '#07070d',

    title: 'Northcrest Launcher',

    frame: !IS_WINDOWS,

    titleBarStyle:
      IS_WINDOWS
        ? 'hidden'
        : 'hiddenInset',

    titleBarOverlay:
      IS_WINDOWS
        ? {
            color: '#07070d',
            symbolColor: '#9d7bff',
            height: 44
          }
        : undefined,

    icon: path.join(
      APP_ROOT,
      'app',
      'assets',
      'icons',
      'app-icon.png'
    ),

    webPreferences: {
      preload: PRELOAD_SCRIPT,

      contextIsolation: true,

      nodeIntegration: false,

      sandbox: true,

      spellcheck: false,

      devTools: true
    }
  });


  /**
   * Mode d'affichage sauvegardé.
   */
  if (
    currentSettings.displayMode ===
    'fullscreen'
  ) {
    mainWindow.setFullScreen(true);
  }


  /**
   * Afficher uniquement lorsque la fenêtre
   * est prête.
   */
  mainWindow.once(
    'ready-to-show',
    () => {
      if (
        mainWindow &&
        !mainWindow.isDestroyed()
      ) {
        mainWindow.show();
      }
    }
  );


  /**
   * DevTools uniquement en développement.
   */
  if (IS_DEV) {
    mainWindow.webContents.openDevTools({
      mode: 'detach'
    });
  }


  /**
   * Chargement du renderer.
   */
  if (IS_DEV) {
    console.log(
      '[Northcrest] Chargement du serveur Vite :',
      DEV_SERVER_URL
    );

    mainWindow
      .loadURL(DEV_SERVER_URL)
      .catch(
        (error) => {
          console.error(
            '[Northcrest] Impossible de charger Vite.',
            error
          );
        }
      );
  } else {
    console.log(
      '[Northcrest] Chargement de :',
      RENDERER_ENTRY
    );

    mainWindow
      .loadFile(RENDERER_ENTRY)
      .catch(
        (error) => {
          console.error(
            '[Northcrest] Impossible de charger le renderer.',
            error
          );
        }
      );
  }


  /**
   * Bloque les ouvertures de fenêtres externes.
   */
  mainWindow.webContents.setWindowOpenHandler(
    ({ url }) => {
      if (isExternalUrl(url)) {
        shell.openExternal(url);
      }

      return {
        action: 'deny'
      };
    }
  );


  /**
   * Bloque les navigations externes.
   */
  mainWindow.webContents.on(
    'will-navigate',
    (event, url) => {
      const targetIsEntryFile =
        url.startsWith('file://') &&
        url.includes('index.html');

      const targetIsDevServer =
        IS_DEV &&
        url.startsWith(DEV_SERVER_URL);

      if (
        !targetIsEntryFile &&
        !targetIsDevServer
      ) {
        event.preventDefault();

        if (isExternalUrl(url)) {
          shell.openExternal(url);
        }
      }
    }
  );


  mainWindow.on(
    'closed',
    () => {
      mainWindow = null;
    }
  );
}


/* ============================================================================
 * MENU APPLICATION
 * ========================================================================== */

function buildApplicationMenu() {
  const template = [
    ...(IS_MAC
      ? [
          {
            label: app.name,

            submenu: [
              {
                role: 'about'
              },

              {
                type: 'separator'
              },

              {
                role: 'services'
              },

              {
                type: 'separator'
              },

              {
                role: 'hide'
              },

              {
                role: 'hideOthers'
              },

              {
                role: 'unhide'
              },

              {
                type: 'separator'
              },

              {
                role: 'quit'
              }
            ]
          }
        ]
      : []),

    {
      label: 'Fichier',

      submenu: [
        {
          label:
            'Ouvrir le dossier de téléchargement',

          click: () => {
            shell
              .openPath(
                currentSettings.downloadFolder
              )
              .catch(
                () => {
                  dialog.showErrorBox(
                    'Northcrest Launcher',
                    "Le dossier de téléchargement n'a pas pu être ouvert."
                  );
                }
              );
          }
        },

        {
          type: 'separator'
        },

        IS_MAC
          ? {
              role: 'close'
            }
          : {
              role: 'quit'
            }
      ]
    },

    {
      label: 'Édition',

      submenu: [
        {
          role: 'undo'
        },

        {
          role: 'redo'
        },

        {
          type: 'separator'
        },

        {
          role: 'cut'
        },

        {
          role: 'copy'
        },

        {
          role: 'paste'
        },

        {
          role: 'selectAll'
        }
      ]
    },

    {
      label: 'Affichage',

      submenu: [
        {
          role: 'reload'
        },

        {
          role: 'forceReload'
        },

        {
          role: 'toggleDevTools'
        },

        {
          type: 'separator'
        },

        {
          role: 'resetZoom'
        },

        {
          role: 'zoomIn'
        },

        {
          role: 'zoomOut'
        },

        {
          type: 'separator'
        },

        {
          role: 'togglefullscreen'
        }
      ]
    },

    {
      label: 'Aide',

      submenu: [
        {
          label:
            'À propos de Northcrest Launcher',

          click: () => {
            dialog.showMessageBox(
              mainWindow,
              {
                type: 'info',

                title:
                  'Northcrest Launcher',

                message:
                  'Northcrest Launcher',

                detail:
                  `Version ${app.getVersion()}\nNorthcrest Entertainment © ${new Date().getFullYear()}`
              }
            );
          }
        },

        {
          label:
            'Vérifier les mises à jour',

          click: async () => {
            const result =
              await checkForUpdates();

            if (!result.success) {
              if (
                result.reason ===
                'disabled'
              ) {
                dialog.showMessageBox(
                  mainWindow,
                  {
                    type: 'info',
                    title:
                      'Northcrest Launcher',
                    message:
                      'Les mises à jour automatiques sont désactivées.'
                  }
                );
              }

              return;
            }

            if (
              !result.updateAvailable
            ) {
              dialog.showMessageBox(
                mainWindow,
                {
                  type: 'info',
                  title:
                    'Northcrest Launcher',
                  message:
                    'Northcrest Launcher est déjà à jour.'
                }
              );
            }
          }
        },

        {
          label:
            'Site officiel',

          click: () => {
            shell.openExternal(
              'https://www.northcrest-entertainment.com'
            );
          }
        }
      ]
    }
  ];

  const menu =
    Menu.buildFromTemplate(
      template
    );

  Menu.setApplicationMenu(menu);
}


/* ============================================================================
 * IPC
 * ========================================================================== */

function registerIpcHandlers() {

  /* --------------------------------------------------------------------------
   * FENÊTRE
   * ------------------------------------------------------------------------ */

  ipcMain.handle(
    'window:minimize',
    () => {
      mainWindow?.minimize();
    }
  );


  ipcMain.handle(
    'window:toggle-maximize',
    () => {
      if (!mainWindow) {
        return;
      }

      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  );


  ipcMain.handle(
    'window:close',
    () => {
      mainWindow?.close();
    }
  );


  ipcMain.handle(
    'window:is-maximized',
    () => {
      return mainWindow
        ? mainWindow.isMaximized()
        : false;
    }
  );


  /* --------------------------------------------------------------------------
   * APPLICATION
   * ------------------------------------------------------------------------ */

  ipcMain.handle(
    'app:get-version',
    () => {
      return app.getVersion();
    }
  );


  ipcMain.handle(
    'app:get-platform',
    () => {
      return process.platform;
    }
  );


  /* --------------------------------------------------------------------------
   * SETTINGS
   * ------------------------------------------------------------------------ */

  ipcMain.handle(
    'settings:get-all',
    () => {
      return currentSettings;
    }
  );


  ipcMain.handle(
    'settings:update',
    (
      _event,
      partialSettings
    ) => {

      currentSettings = {
        ...currentSettings,
        ...partialSettings
      };

      const success =
        saveSettings(
          currentSettings
        );


      nativeTheme.themeSource =
        currentSettings.theme ===
        'light'
          ? 'light'
          : 'dark';


      if (
        mainWindow &&
        currentSettings.displayMode
      ) {
        if (
          currentSettings.displayMode ===
          'fullscreen'
        ) {
          mainWindow.setFullScreen(true);
        } else {
          mainWindow.setFullScreen(false);
        }
      }


      return {
        success,

        settings:
          currentSettings
      };
    }
  );


  ipcMain.handle(
    'settings:choose-download-folder',
    async () => {

      if (!mainWindow) {
        return null;
      }


      const result =
        await dialog.showOpenDialog(
          mainWindow,
          {
            title:
              'Choisir le dossier de téléchargement',

            defaultPath:
              currentSettings.downloadFolder,

            properties: [
              'openDirectory',
              'createDirectory'
            ]
          }
        );


      if (
        result.canceled ||
        result.filePaths.length === 0
      ) {
        return null;
      }


      const chosenPath =
        result.filePaths[0];


      currentSettings.downloadFolder =
        chosenPath;


      saveSettings(
        currentSettings
      );


      return chosenPath;
    }
  );


  /* --------------------------------------------------------------------------
   * SHELL
   * ------------------------------------------------------------------------ */

  ipcMain.handle(
    'shell:open-external',
    (
      _event,
      url
    ) => {

      if (
        isExternalUrl(url)
      ) {
        shell.openExternal(url);

        return true;
      }

      return false;
    }
  );


  /* --------------------------------------------------------------------------
   * AUTH
   * ------------------------------------------------------------------------ */

  ipcMain.handle(
    'auth:get-session',
    () => {

      return {
        authenticated: true,

        id:
          'NCR-884271',

        displayName:
          'Rywan_G',

        email:
          'rywan@northcrest-entertainment.com',

        storageUsedGb:
          42.7,

        storageTotalGb:
          100
      };
    }
  );


  /* --------------------------------------------------------------------------
   * GAMES
   * ------------------------------------------------------------------------ */

  ipcMain.handle(
    'games:get-library',
    () => {

      const installed =
        isBlackBridgeInstalled();


      return [
        {
          id:
            'cmk8r4x7p0000qz9v5n2m6t1a',

          title:
            'BlackBridge',

          version:
            '1.2.4',

          status:
            installed
              ? 'installed'
              : 'not-installed',

          sizeGb:
            78.3,

          executable:
            'Northcrest.exe'
        }
      ];
    }
  );


  /* --------------------------------------------------------------------------
   * LAUNCH BLACKBRIDGE
   * ------------------------------------------------------------------------ */

  ipcMain.handle(
    'games:launch',
    (
      _event,
      gameId,
      launchCode
    ) => {

      console.log(
        `[Northcrest] Demande de lancement pour : ${gameId}`
      );


      /* ----------------------------------------------------------------------
       * Vérification du jeu
       * -------------------------------------------------------------------- */

      if (
        gameId !==
        'cmk8r4x7p0000qz9v5n2m6t1a'
      ) {
        return {
          launched: false,

          gameId,

          error:
            'UNKNOWN_GAME',

          message:
            'Jeu Northcrest inconnu.'
        };
      }


      /* ----------------------------------------------------------------------
       * Vérification du ticket
       * -------------------------------------------------------------------- */

      if (
        !isValidLaunchCode(
          launchCode
        )
      ) {

        console.error(
          '[Northcrest] Code de lancement invalide ou absent.'
        );


        return {
          launched: false,

          gameId,

          error:
            'INVALID_LAUNCH_CODE',

          message:
            'Session de lancement Northcrest invalide.'
        };
      }


      const gameDirectory =
        getBlackBridgeDirectory();


      const executablePath =
        getBlackBridgeExecutable();


      console.log(
        '[Northcrest] Dossier du jeu :',
        gameDirectory
      );


      console.log(
        '[Northcrest] Exécutable :',
        executablePath
      );


      console.log(
        '[Northcrest] LauncherSession reçue.'
      );


      /* ----------------------------------------------------------------------
       * Installation
       * -------------------------------------------------------------------- */

      if (
        !fs.existsSync(
          executablePath
        )
      ) {

        console.log(
          '[Northcrest] BlackBridge.exe introuvable.'
        );


        return {
          launched: false,

          gameId,

          error:
            'GAME_NOT_INSTALLED',

          message:
            'BlackBridge n’est pas encore installé.',

          path:
            executablePath
        };
      }


      /* ----------------------------------------------------------------------
       * Lancement
       * -------------------------------------------------------------------- */

      try {

        const gameProcess =
          spawn(
            executablePath,
            [
              '--northcrest-launch-ticket',
              launchCode
            ],
            {
              cwd:
                gameDirectory,

              detached:
                true,

              stdio:
                'ignore',

              windowsHide:
                false
            }
          );


        gameProcess.unref();


        console.log(
          `[Northcrest] BlackBridge lancé avec succès. PID : ${gameProcess.pid}`
        );


        return {
          launched: true,

          gameId,

          pid:
            gameProcess.pid
        };

      } catch (error) {

        console.error(
          '[Northcrest] Impossible de lancer BlackBridge.',
          error
        );


        return {
          launched: false,

          gameId,

          error:
            'LAUNCH_FAILED',

          message:
            'Impossible de lancer BlackBridge.'
        };
      }
    }
  );


  /* --------------------------------------------------------------------------
   * AUTO UPDATE
   * ------------------------------------------------------------------------ */

  ipcMain.handle(
    'updater:check',
    async () => {
      return await checkForUpdates();
    }
  );


  ipcMain.handle(
    'updater:install',
    () => {
      return installUpdate();
    }
  );
}


/* ============================================================================
 * LIFECYCLE ELECTRON
 * ========================================================================== */

app.whenReady().then(
  () => {

    console.log(
      '[Northcrest] Démarrage du Launcher...'
    );


    currentSettings =
      loadSettings();


    nativeTheme.themeSource =
      currentSettings.theme ===
      'light'
        ? 'light'
        : 'dark';


    registerIpcHandlers();


    buildApplicationMenu();


    createMainWindow();


    /**
     * Configure l'auto-update après
     * création de la fenêtre.
     */
    setupAutoUpdater();


    app.on(
      'activate',
      () => {

        if (
          BrowserWindow.getAllWindows()
            .length === 0
        ) {
          createMainWindow();
        }
      }
    );
  }
);


/* ============================================================================
 * FERMETURE
 * ========================================================================== */

app.on(
  'window-all-closed',
  () => {

    if (!IS_MAC) {
      app.quit();
    }
  }
);


/* ============================================================================
 * SÉCURITÉ WEBCONTENTS
 * ========================================================================== */

app.on(
  'web-contents-created',
  (
    _event,
    contents
  ) => {

    contents.on(
      'will-attach-webview',
      (
        event
      ) => {

        event.preventDefault();
      }
    );


    /**
     * Empêche les ouvertures de DevTools
     * provenant du contenu distant.
     */
    contents.on(
      'will-navigate',
      (
        event,
        url
      ) => {

        if (
          isExternalUrl(url)
        ) {
          event.preventDefault();
        }
      }
    );
  }
);