'use strict';

/**
 * Northcrest Launcher — Processus principal (Main Process)
 * ----------------------------------------------------------
 * Ce fichier est le point d'entrée d'Electron. Il gère :
 *  - la création et le cycle de vie de la fenêtre principale
 *  - la configuration de sécurité (contextIsolation, sandbox, CSP)
 *  - le menu applicatif natif
 *  - les canaux IPC exposés au renderer via le preload
 *  - les fonctionnalités natives du launcher
 *  - le lancement de Northcrest.exe
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


/**
 * ---------------------------------------------------------------------------
 * Constantes globales
 * ---------------------------------------------------------------------------
 */

const IS_DEV =
  process.argv.includes('--dev');


const IS_MAC =
  process.platform === 'darwin';


const IS_WINDOWS =
  process.platform === 'win32';


const APP_ROOT =
  path.join(
    __dirname,
    '..'
  );


const RENDERER_ENTRY =
  path.join(
    APP_ROOT,
    'app',
    'dist',
    'index.html'
  );


const DEV_SERVER_URL =
  'http://localhost:5173';


const PRELOAD_SCRIPT =
  path.join(
    __dirname,
    'preload.js'
  );


const MIN_WINDOW_WIDTH =
  1180;


const MIN_WINDOW_HEIGHT =
  720;


/**
 * Dossier de configuration utilisateur.
 */

const USER_DATA_DIR =
  app.getPath(
    'userData'
  );


const SETTINGS_FILE =
  path.join(
    USER_DATA_DIR,
    'northcrest-settings.json'
  );


const DEFAULT_SETTINGS =
{
  theme:
    'dark',

  language:
    'fr-FR',

  downloadFolder:
    path.join(
      os.homedir(),
      'Northcrest Games'
    ),

  autoUpdateGames:
    true,

  autoUpdateLauncher:
    true
};


/**
 * ---------------------------------------------------------------------------
 * État global
 * ---------------------------------------------------------------------------
 */

/** @type {BrowserWindow | null} */
let mainWindow =
  null;


let currentSettings =
  DEFAULT_SETTINGS;


/**
 * ---------------------------------------------------------------------------
 * Gestion des préférences
 * ---------------------------------------------------------------------------
 */

function ensureUserDataDir()
{
  if (
    !fs.existsSync(
      USER_DATA_DIR
    )
  )
  {
    fs.mkdirSync(
      USER_DATA_DIR,
      {
        recursive:
          true
      }
    );
  }
}


function loadSettings()
{
  try
  {
    ensureUserDataDir();


    if (
      fs.existsSync(
        SETTINGS_FILE
      )
    )
    {
      const raw =
        fs.readFileSync(
          SETTINGS_FILE,
          'utf-8'
        );


      const parsed =
        JSON.parse(
          raw
        );


      return {
        ...DEFAULT_SETTINGS,
        ...parsed
      };
    }
  }
  catch (error)
  {
    console.error(
      '[Northcrest] Impossible de lire les préférences, retour aux valeurs par défaut.',
      error
    );
  }


  return {
    ...DEFAULT_SETTINGS
  };
}


function saveSettings(
  settings
)
{
  try
  {
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
  }
  catch (error)
  {
    console.error(
      '[Northcrest] Impossible d’enregistrer les préférences.',
      error
    );


    return false;
  }
}


/**
 * ---------------------------------------------------------------------------
 * Création de la fenêtre principale
 * ---------------------------------------------------------------------------
 */

function createMainWindow()
{
  mainWindow =
    new BrowserWindow({
      width:
        1440,

      height:
        900,

      minWidth:
        MIN_WINDOW_WIDTH,

      minHeight:
        MIN_WINDOW_HEIGHT,

      show:
        true,

      backgroundColor:
        '#07070d',

      title:
        'Northcrest Launcher',

      frame:
        !IS_WINDOWS,

      titleBarStyle:
        IS_WINDOWS
          ? 'hidden'
          : 'hiddenInset',

      titleBarOverlay:
        IS_WINDOWS
          ? {
              color:
                '#07070d',

              symbolColor:
                '#9d7bff',

              height:
                44
            }
          : undefined,

      icon:
        path.join(
          APP_ROOT,
          'app',
          'assets',
          'icons',
          'app-icon.png'
        ),

      webPreferences:
      {
        preload:
          PRELOAD_SCRIPT,

        contextIsolation:
          true,

        nodeIntegration:
          false,

        sandbox:
          true,

        spellcheck:
          false,

        devTools:
          true
      }
    });


  mainWindow.show();


  /**
   * DevTools uniquement en développement.
   */

  if (IS_DEV)
  {
    mainWindow.webContents.openDevTools({
      mode:
        'detach'
    });
  }


  if (IS_DEV)
  {
    console.log(
      '[Northcrest] Chargement du serveur Vite :',
      DEV_SERVER_URL
    );


    mainWindow
      .loadURL(
        DEV_SERVER_URL
      )
      .catch(
        (error) =>
        {
          console.error(
            '[Northcrest] Impossible de charger le serveur Vite.',
            error
          );
        }
      );
  }
  else
  {
    console.log(
      '[Northcrest] Chargement de :',
      RENDERER_ENTRY
    );


    mainWindow
      .loadFile(
        RENDERER_ENTRY
      )
      .catch(
        (error) =>
        {
          console.error(
            '[Northcrest] Impossible de charger le renderer.',
            error
          );
        }
      );
  }


  /**
   * Ouverture des liens externes.
   */

  mainWindow.webContents.setWindowOpenHandler(
    ({ url }) =>
    {
      if (
        isExternalUrl(
          url
        )
      )
      {
        shell.openExternal(
          url
        );
      }


      return {
        action:
          'deny'
      };
    }
  );


  /**
   * Bloque les navigations externes.
   */

  mainWindow.webContents.on(
    'will-navigate',
    (
      event,
      url
    ) =>
    {
      const targetIsEntryFile =
        url.startsWith(
          'file://'
        ) &&
        url.includes(
          'index.html'
        );


      const targetIsDevServer =
        IS_DEV &&
        url.startsWith(
          DEV_SERVER_URL
        );


      if (
        !targetIsEntryFile &&
        !targetIsDevServer
      )
      {
        event.preventDefault();


        if (
          isExternalUrl(
            url
          )
        )
        {
          shell.openExternal(
            url
          );
        }
      }
    }
  );


  mainWindow.on(
    'closed',
    () =>
    {
      mainWindow =
        null;
    }
  );
}


function isExternalUrl(
  url
)
{
  return /^https?:\/\//i.test(
    url
  );
}


/**
 * ---------------------------------------------------------------------------
 * Menu applicatif natif
 * ---------------------------------------------------------------------------
 */

function buildApplicationMenu()
{
  /** @type {Electron.MenuItemConstructorOptions[]} */

  const template =
  [
    ...(IS_MAC
      ? [
          {
            label:
              app.name,

            submenu:
            [
              {
                role:
                  'about'
              },

              {
                type:
                  'separator'
              },

              {
                role:
                  'services'
              },

              {
                type:
                  'separator'
              },

              {
                role:
                  'hide'
              },

              {
                role:
                  'hideOthers'
              },

              {
                role:
                  'unhide'
              },

              {
                type:
                  'separator'
              },

              {
                role:
                  'quit'
              }
            ]
          }
        ]
      : []),

    {
      label:
        'Fichier',

      submenu:
      [
        {
          label:
            'Ouvrir le dossier de téléchargement',

          click:
            () =>
            {
              shell
                .openPath(
                  currentSettings.downloadFolder
                )
                .catch(
                  () =>
                  {
                    dialog.showErrorBox(
                      'Northcrest Launcher',
                      "Le dossier de téléchargement n'a pas pu être ouvert."
                    );
                  }
                );
            }
        },

        {
          type:
            'separator'
        },

        IS_MAC
          ? {
              role:
                'close'
            }
          : {
              role:
                'quit'
            }
      ]
    },

    {
      label:
        'Édition',

      submenu:
      [
        {
          role:
            'undo'
        },

        {
          role:
            'redo'
        },

        {
          type:
            'separator'
        },

        {
          role:
            'cut'
        },

        {
          role:
            'copy'
        },

        {
          role:
            'paste'
        },

        {
          role:
            'selectAll'
        }
      ]
    },

    {
      label:
        'Affichage',

      submenu:
      [
        {
          role:
            'reload'
        },

        {
          role:
            'forceReload'
        },

        {
          role:
            'toggleDevTools'
        },

        {
          type:
            'separator'
        },

        {
          role:
            'resetZoom'
        },

        {
          role:
            'zoomIn'
        },

        {
          role:
            'zoomOut'
        },

        {
          type:
            'separator'
        },

        {
          role:
            'togglefullscreen'
        }
      ]
    },

    {
      label:
        'Aide',

      submenu:
      [
        {
          label:
            'À propos de Northcrest Launcher',

          click:
            () =>
            {
              dialog.showMessageBox(
                mainWindow,
                {
                  type:
                    'info',

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
            'Site officiel',

          click:
            () =>
            {
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


  Menu.setApplicationMenu(
    menu
  );
}


/**
 * ---------------------------------------------------------------------------
 * Recherche et lancement des jeux
 * ---------------------------------------------------------------------------
 */

/**
 * Build locale Unreal — développement.
 */

const DEVELOPMENT_GAME_DIRECTORY =
  'C:\\Users\\stan4\\OneDrive\\Documents\\Unreal Projects\\GothamCity 5.7\\Saved\\NorthcrestBuilds\\Development\\Windows';


function getBlackBridgeDirectory()
{
  if (IS_DEV)
  {
    return DEVELOPMENT_GAME_DIRECTORY;
  }


  return path.join(
    currentSettings.downloadFolder,
    'BlackBridge'
  );
}


function getBlackBridgeExecutable()
{
  return path.join(
    getBlackBridgeDirectory(),
    'Northcrest.exe'
  );
}


function isBlackBridgeInstalled()
{
  return fs.existsSync(
    getBlackBridgeExecutable()
  );
}


/**
 * ---------------------------------------------------------------------------
 * Validation du code de lancement Northcrest
 * ---------------------------------------------------------------------------
 */

function isValidLaunchCode(
  launchCode
)
{
  if (
    typeof launchCode !==
    'string'
  )
  {
    return false;
  }


  return /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(
    launchCode
  );
}


/**
 * ---------------------------------------------------------------------------
 * Canaux IPC
 * ---------------------------------------------------------------------------
 */

function registerIpcHandlers()
{
  // -------------------------------------------------------------------------
  // Fenêtre
  // -------------------------------------------------------------------------

  ipcMain.handle(
    'window:minimize',
    () =>
    {
      mainWindow?.minimize();
    }
  );


  ipcMain.handle(
    'window:toggle-maximize',
    () =>
    {
      if (!mainWindow)
      {
        return;
      }


      if (
        mainWindow.isMaximized()
      )
      {
        mainWindow.unmaximize();
      }
      else
      {
        mainWindow.maximize();
      }
    }
  );


  ipcMain.handle(
    'window:close',
    () =>
    {
      mainWindow?.close();
    }
  );


  ipcMain.handle(
    'window:is-maximized',
    () =>
    {
      return mainWindow
        ? mainWindow.isMaximized()
        : false;
    }
  );


  // -------------------------------------------------------------------------
  // Application
  // -------------------------------------------------------------------------

  ipcMain.handle(
    'app:get-version',
    () =>
    {
      return app.getVersion();
    }
  );


  ipcMain.handle(
    'app:get-platform',
    () =>
    {
      return process.platform;
    }
  );


  // -------------------------------------------------------------------------
  // Préférences
  // -------------------------------------------------------------------------

  ipcMain.handle(
    'settings:get-all',
    () =>
    {
      return currentSettings;
    }
  );


  ipcMain.handle(
    'settings:update',
    (
      _event,
      partialSettings
    ) =>
    {
      currentSettings =
      {
        ...currentSettings,
        ...partialSettings
      };


      const success =
        saveSettings(
          currentSettings
        );


      return {
        success,

        settings:
          currentSettings
      };
    }
  );


  ipcMain.handle(
    'settings:choose-download-folder',
    async () =>
    {
      if (!mainWindow)
      {
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

            properties:
            [
              'openDirectory',
              'createDirectory'
            ]
          }
        );


      if (
        result.canceled ||
        result.filePaths.length === 0
      )
      {
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


  // -------------------------------------------------------------------------
  // Liens externes
  // -------------------------------------------------------------------------

  ipcMain.handle(
    'shell:open-external',
    (
      _event,
      url
    ) =>
    {
      if (
        isExternalUrl(
          url
        )
      )
      {
        shell.openExternal(
          url
        );


        return true;
      }


      return false;
    }
  );


  // -------------------------------------------------------------------------
  // Session locale temporaire
  // -------------------------------------------------------------------------

  ipcMain.handle(
    'auth:get-session',
    () =>
    {
      return {
        authenticated:
          true,

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


  // -------------------------------------------------------------------------
  // Bibliothèque locale temporaire
  // -------------------------------------------------------------------------

  ipcMain.handle(
    'games:get-library',
    () =>
    {
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


  // -------------------------------------------------------------------------
  // Lancement de BlackBridge
  // -------------------------------------------------------------------------

  ipcMain.handle(
    'games:launch',
    (
      _event,
      gameId,
      launchCode
    ) =>
    {
      console.log(
        `[Northcrest] Demande de lancement pour : ${gameId}`
      );


      /**
       * ------------------------------------------------------
       * Vérification du jeu
       * ------------------------------------------------------
       */

      if (
        gameId !==
        'cmk8r4x7p0000qz9v5n2m6t1a'
      )
      {
        return {
          launched:
            false,

          gameId,

          error:
            'UNKNOWN_GAME',

          message:
            'Jeu Northcrest inconnu.'
        };
      }


      /**
       * ------------------------------------------------------
       * Vérification du code de lancement
       * ------------------------------------------------------
       *
       * Le jeu ne doit jamais être lancé depuis le Launcher
       * sans une LauncherSession valide.
       */

      if (
        !isValidLaunchCode(
          launchCode
        )
      )
      {
        console.error(
          '[Northcrest] Code de lancement Northcrest invalide ou absent.'
        );


        return {
          launched:
            false,

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


      /**
       * ------------------------------------------------------
       * Vérification de l'installation
       * ------------------------------------------------------
       */

      if (
        !fs.existsSync(
          executablePath
        )
      )
      {
        console.log(
          '[Northcrest] BlackBridge.exe introuvable.'
        );


        return {
          launched:
            false,

          gameId,

          error:
            'GAME_NOT_INSTALLED',

          message:
            'BlackBridge n’est pas encore installé.',

          path:
            executablePath
        };
      }


      /**
       * ------------------------------------------------------
       * Lancement du jeu
       * ------------------------------------------------------
       *
       * IMPORTANT :
       *
       * Nous ne transmettons jamais :
       *
       * - accessToken
       * - refreshToken
       * - mot de passe
       *
       * Le jeu reçoit uniquement le code temporaire
       * de LauncherSession.
       */

      try
      {
        const GameProcess =
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


        GameProcess.unref();


        console.log(
          `[Northcrest] BlackBridge lancé avec succès. PID : ${GameProcess.pid}`
        );


        return {
          launched:
            true,

          gameId,

          pid:
            GameProcess.pid
        };
      }
      catch (error)
      {
        console.error(
          '[Northcrest] Impossible de lancer BlackBridge.',
          error
        );


        return {
          launched:
            false,

          gameId,

          error:
            'LAUNCH_FAILED',

          message:
            'Impossible de lancer BlackBridge.'
        };
      }
    }
  );
}


/**
 * ---------------------------------------------------------------------------
 * Cycle de vie de l'application
 * ---------------------------------------------------------------------------
 */

app.whenReady().then(
  () =>
  {
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


    app.on(
      'activate',
      () =>
      {
        if (
          BrowserWindow.getAllWindows().length ===
          0
        )
        {
          createMainWindow();
        }
      }
    );
  }
);


app.on(
  'window-all-closed',
  () =>
  {
    if (
      !IS_MAC
    )
    {
      app.quit();
    }
  }
);


/**
 * ---------------------------------------------------------------------------
 * Sécurité WebContents
 * ---------------------------------------------------------------------------
 */

app.on(
  'web-contents-created',
  (
    _event,
    contents
  ) =>
  {
    contents.on(
      'will-attach-webview',
      (
        event
      ) =>
      {
        event.preventDefault();
      }
    );
  }
);