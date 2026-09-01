import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import {
  getInitialLanguage,
  setLanguage,
  type LanguageCode
} from "./index";

interface I18nContextValue {
  language: LanguageCode;

  changeLanguage: (
    language: LanguageCode
  ) => void;

  t: (
    key: string
  ) => string;
}

const I18nContext =
  createContext<I18nContextValue | null>(null);

const translations: Partial<
  Record<
    LanguageCode,
  Record<string, string>
  >
> = {
  "fr-FR": {
    "nav.home": "Accueil",
    "nav.games": "Jeux",
    "nav.downloads": "Téléchargements",
    "nav.news": "Actualités",
    "nav.community": "Communauté",
    "nav.store": "Boutique NC",
    "nav.friends": "Amis",
    "nav.messages": "Messages",
    "nav.cloud": "Cloud Save",
    "nav.settings": "Paramètres",
    "nav.creator": "Creator Hub",
    "settings.title": "Paramètres",
    "settings.language": "Langue",
    "settings.languageDescription": "Langue de l’interface du launcher.",
    "settings.downloadFolder": "Dossier de téléchargement",
    "settings.downloadFolderDescription":
      "Emplacement d’installation des jeux et des mises à jour.",
    "settings.browse": "Parcourir",
    "settings.autoUpdateGames": "Mises à jour automatiques des jeux",
    "settings.autoUpdateGamesDescription":
      "Télécharge les nouvelles versions en arrière-plan dès leur publication.",
    "settings.autoUpdateLauncher": "Mises à jour automatiques du launcher",
    "settings.autoUpdateLauncherDescription":
      "Le launcher s’installe silencieusement au prochain démarrage.",
    "settings.version": "Version"
  },

  "en-US": {
    "nav.home": "Home",
    "nav.games": "Games",
    "nav.downloads": "Downloads",
    "nav.news": "News",
    "nav.community": "Community",
    "nav.store": "NC Store",
    "nav.friends": "Friends",
    "nav.messages": "Messages",
    "nav.cloud": "Cloud Save",
    "nav.settings": "Settings",
    "nav.creator": "Creator Hub",
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.languageDescription": "Launcher interface language.",
    "settings.downloadFolder": "Download folder",
    "settings.downloadFolderDescription":
      "Installation location for games and updates.",
    "settings.browse": "Browse",
    "settings.autoUpdateGames": "Automatic game updates",
    "settings.autoUpdateGamesDescription":
      "Download new versions in the background as soon as they are published.",
    "settings.autoUpdateLauncher": "Automatic launcher updates",
    "settings.autoUpdateLauncherDescription":
      "The launcher installs silently on the next startup.",
    "settings.version": "Version"
  },

  "de-DE": {
    "nav.home": "Startseite",
    "nav.games": "Spiele",
    "nav.downloads": "Downloads",
    "nav.news": "Neuigkeiten",
    "nav.community": "Community",
    "nav.store": "NC-Shop",
    "nav.friends": "Freunde",
    "nav.messages": "Nachrichten",
    "nav.cloud": "Cloud-Speicher",
    "nav.settings": "Einstellungen",
    "nav.creator": "Creator Hub",
    "settings.title": "Einstellungen",
    "settings.language": "Sprache",
    "settings.languageDescription": "Sprache der Launcher-Oberfläche.",
    "settings.downloadFolder": "Download-Ordner",
    "settings.downloadFolderDescription":
      "Installationsort für Spiele und Updates.",
    "settings.browse": "Durchsuchen",
    "settings.autoUpdateGames": "Automatische Spiel-Updates",
    "settings.autoUpdateGamesDescription":
      "Neue Versionen nach Veröffentlichung im Hintergrund herunterladen.",
    "settings.autoUpdateLauncher": "Automatische Launcher-Updates",
    "settings.autoUpdateLauncherDescription":
      "Der Launcher wird beim nächsten Start automatisch installiert.",
    "settings.version": "Version"
  },

  "es-ES": {
    "nav.home": "Inicio",
    "nav.games": "Juegos",
    "nav.downloads": "Descargas",
    "nav.news": "Noticias",
    "nav.community": "Comunidad",
    "nav.store": "Tienda NC",
    "nav.friends": "Amigos",
    "nav.messages": "Mensajes",
    "nav.cloud": "Guardado en la nube",
    "nav.settings": "Configuración",
    "nav.creator": "Creator Hub",
    "settings.title": "Configuración",
    "settings.language": "Idioma",
    "settings.languageDescription":
      "Idioma de la interfaz del launcher.",
    "settings.downloadFolder": "Carpeta de descargas",
    "settings.downloadFolderDescription":
      "Ubicación de instalación de juegos y actualizaciones.",
    "settings.browse": "Explorar",
    "settings.autoUpdateGames":
      "Actualizaciones automáticas de juegos",
    "settings.autoUpdateGamesDescription":
      "Descarga nuevas versiones en segundo plano cuando se publiquen.",
    "settings.autoUpdateLauncher":
      "Actualizaciones automáticas del launcher",
    "settings.autoUpdateLauncherDescription":
      "El launcher se instalará silenciosamente en el próximo inicio.",
    "settings.version": "Versión"
  },

  "it-IT": {
    "nav.home": "Home",
    "nav.games": "Giochi",
    "nav.downloads": "Download",
    "nav.news": "Notizie",
    "nav.community": "Community",
    "nav.store": "Negozio NC",
    "nav.friends": "Amici",
    "nav.messages": "Messaggi",
    "nav.cloud": "Salvataggi cloud",
    "nav.settings": "Impostazioni",
    "nav.creator": "Creator Hub",
    "settings.title": "Impostazioni",
    "settings.language": "Lingua",
    "settings.languageDescription":
      "Lingua dell'interfaccia del launcher.",
    "settings.downloadFolder": "Cartella download",
    "settings.downloadFolderDescription":
      "Posizione di installazione dei giochi e degli aggiornamenti.",
    "settings.browse": "Sfoglia",
    "settings.autoUpdateGames":
      "Aggiornamenti automatici dei giochi",
    "settings.autoUpdateGamesDescription":
      "Scarica le nuove versioni in background quando vengono pubblicate.",
    "settings.autoUpdateLauncher":
      "Aggiornamenti automatici del launcher",
    "settings.autoUpdateLauncherDescription":
      "Il launcher verrà installato automaticamente al prossimo avvio.",
    "settings.version": "Versione"
  },

  "pt-PT": {
    "nav.home": "Início",
    "nav.games": "Jogos",
    "nav.downloads": "Transferências",
    "nav.news": "Notícias",
    "nav.community": "Comunidade",
    "nav.store": "Loja NC",
    "nav.friends": "Amigos",
    "nav.messages": "Mensagens",
    "nav.cloud": "Guardado na nuvem",
    "nav.settings": "Definições",
    "nav.creator": "Creator Hub",
    "settings.title": "Definições",
    "settings.language": "Idioma",
    "settings.languageDescription":
      "Idioma da interface do launcher.",
    "settings.downloadFolder": "Pasta de transferências",
    "settings.downloadFolderDescription":
      "Local de instalação dos jogos e atualizações.",
    "settings.browse": "Procurar",
    "settings.autoUpdateGames":
      "Atualizações automáticas dos jogos",
    "settings.autoUpdateGamesDescription":
      "Transfere novas versões em segundo plano assim que forem publicadas.",
    "settings.autoUpdateLauncher":
      "Atualizações automáticas do launcher",
    "settings.autoUpdateLauncherDescription":
      "O launcher instala-se silenciosamente no próximo arranque.",
    "settings.version": "Versão"
  },

  "pt-BR": {
    "nav.home": "Início",
    "nav.games": "Jogos",
    "nav.downloads": "Downloads",
    "nav.news": "Notícias",
    "nav.community": "Comunidade",
    "nav.store": "Loja NC",
    "nav.friends": "Amigos",
    "nav.messages": "Mensagens",
    "nav.cloud": "Salvamento na nuvem",
    "nav.settings": "Configurações",
    "nav.creator": "Creator Hub",
    "settings.title": "Configurações",
    "settings.language": "Idioma",
    "settings.languageDescription":
      "Idioma da interface do launcher.",
    "settings.downloadFolder": "Pasta de downloads",
    "settings.downloadFolderDescription":
      "Local de instalação dos jogos e atualizações.",
    "settings.browse": "Procurar",
    "settings.autoUpdateGames":
      "Atualizações automáticas dos jogos",
    "settings.autoUpdateGamesDescription":
      "Baixa novas versões em segundo plano assim que forem publicadas.",
    "settings.autoUpdateLauncher":
      "Atualizações automáticas do launcher",
    "settings.autoUpdateLauncherDescription":
      "O launcher será instalado silenciosamente na próxima inicialização.",
    "settings.version": "Versão"
  }
};

function translate(
  language: LanguageCode,
  key: string
): string {
  return (
    translations[language]?.[key] ??
    translations["en-US"]?.[key] ??
    key
  );
}

export function I18nProvider({
  children
}: {
  children: ReactNode;
}) {
  const [
    language,
    setCurrentLanguage
  ] = useState<LanguageCode>(
    getInitialLanguage()
  );

  useEffect(() => {
    setLanguage(language);
  }, [language]);

  const value = useMemo(
    () => ({
      language,

      changeLanguage: (
        nextLanguage: LanguageCode
      ) => {
        setCurrentLanguage(
          nextLanguage
        );
      },

      t: (key: string) =>
        translate(
          language,
          key
        )
    }),
    [language]
  );

  return (
    <I18nContext.Provider
      value={value}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context =
    useContext(I18nContext);

  if (!context) {
    throw new Error(
      "useI18n must be used inside I18nProvider."
    );
  }

  return context;
}
