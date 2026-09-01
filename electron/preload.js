'use strict';

/**
 * Northcrest Launcher — Script de préchargement (Preload)
 * ----------------------------------------------------------
 * Exécuté dans un contexte isolé, ce script expose une API minimale
 * et contrôlée au renderer via `contextBridge`.
 *
 * L'API officielle est :
 *
 *     window.northcrest
 *
 * Un alias `window.electronAPI` est également exposé pour permettre
 * au renderer existant d'utiliser la même API sans accès direct à
 * Node.js ou à Electron.
 */

const { contextBridge, ipcRenderer } = require('electron');


/**
 * Enveloppe un appel ipcRenderer.invoke pour éviter toute fuite
 * de l'objet event ou d'objets Electron internes vers le renderer.
 */
function invoke(channel, ...args)
{
  return ipcRenderer.invoke(
    channel,
    ...args
  );
}


/**
 * API publique Northcrest.
 *
 * Cette même référence sera exposée sous :
 *
 *     window.northcrest
 *     window.electronAPI
 */
const NorthcrestAPI =
{
  // -------------------------------------------------------------------
  // Contrôles de fenêtre
  // -------------------------------------------------------------------

  window:
  {
    minimize:
      () =>
        invoke(
          'window:minimize'
        ),

    toggleMaximize:
      () =>
        invoke(
          'window:toggle-maximize'
        ),

    close:
      () =>
        invoke(
          'window:close'
        ),

    isMaximized:
      () =>
        invoke(
          'window:is-maximized'
        )
  },


  // -------------------------------------------------------------------
  // Informations générales sur l'application
  // -------------------------------------------------------------------

  app:
  {
    getVersion:
      () =>
        invoke(
          'app:get-version'
        ),

    getPlatform:
      () =>
        invoke(
          'app:get-platform'
        )
  },


  // -------------------------------------------------------------------
  // Préférences utilisateur
  // -------------------------------------------------------------------

  settings:
  {
    getAll:
      () =>
        invoke(
          'settings:get-all'
        ),

    update:
      partialSettings =>
        invoke(
          'settings:update',
          partialSettings
        ),

    chooseDownloadFolder:
      () =>
        invoke(
          'settings:choose-download-folder'
        )
  },


  // -------------------------------------------------------------------
  // Liens externes
  // -------------------------------------------------------------------

  shell:
  {
    openExternal:
      url =>
        invoke(
          'shell:open-external',
          url
        )
  },


  // -------------------------------------------------------------------
  // Authentification Northcrest ID
  // -------------------------------------------------------------------

  auth:
  {
    getSession:
      () =>
        invoke(
          'auth:get-session'
        )
  },


  // -------------------------------------------------------------------
  // Bibliothèque de jeux
  // -------------------------------------------------------------------

  games:
  {
    getLibrary:
      () =>
        invoke(
          'games:get-library'
        ),

    launch:
      (
        gameId,
        launchTicket
      ) =>
        invoke(
          'games:launch',
          gameId,
          launchTicket
        )
  }
};


/**
 * API officielle.
 */
contextBridge.exposeInMainWorld(
  'northcrest',
  NorthcrestAPI
);


/**
 * Alias de compatibilité.
 *
 * Permet au renderer d'utiliser :
 *
 *     window.electronAPI.games.launch(...)
 *
 * tout en utilisant exactement les mêmes fonctions IPC.
 */
contextBridge.exposeInMainWorld(
  'electronAPI',
  NorthcrestAPI
);