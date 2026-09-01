/**
 * Northcrest Launcher - i18n
 *
 * Détection automatique de la langue du système,
 * stockage de la préférence utilisateur et gestion du document HTML.
 */

export type LanguageCode =
  | "fr-FR"
  | "en-US"
  | "de-DE"
  | "es-ES"
  | "it-IT"
  | "pt-PT"
  | "pt-BR"
  | "nl-NL"
  | "pl-PL"
  | "ru-RU"
  | "uk-UA"
  | "tr-TR"
  | "ja-JP"
  | "ko-KR"
  | "zh-CN"
  | "zh-TW"
  | "ar-SA"
  | "hi-IN"
  | "sv-SE"
  | "da-DK"
  | "no-NO"
  | "fi-FI"
  | "cs-CZ"
  | "hu-HU"
  | "ro-RO"
  | "el-GR"
  | "he-IL";

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const LANGUAGES: readonly Language[] = [
  { code: "fr-FR", name: "French", nativeName: "Français" },
  { code: "en-US", name: "English", nativeName: "English" },
  { code: "de-DE", name: "German", nativeName: "Deutsch" },
  { code: "es-ES", name: "Spanish", nativeName: "Español" },
  { code: "it-IT", name: "Italian", nativeName: "Italiano" },
  { code: "pt-PT", name: "Portuguese", nativeName: "Português" },
  { code: "pt-BR", name: "Portuguese (Brazil)", nativeName: "Português (Brasil)" },
  { code: "nl-NL", name: "Dutch", nativeName: "Nederlands" },
  { code: "pl-PL", name: "Polish", nativeName: "Polski" },
  { code: "ru-RU", name: "Russian", nativeName: "Русский" },
  { code: "uk-UA", name: "Ukrainian", nativeName: "Українська" },
  { code: "tr-TR", name: "Turkish", nativeName: "Türkçe" },
  { code: "ja-JP", name: "Japanese", nativeName: "日本語" },
  { code: "ko-KR", name: "Korean", nativeName: "한국어" },
  { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文" },
  { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "繁體中文" },
  { code: "ar-SA", name: "Arabic", nativeName: "العربية" },
  { code: "hi-IN", name: "Hindi", nativeName: "हिन्दी" },
  { code: "sv-SE", name: "Swedish", nativeName: "Svenska" },
  { code: "da-DK", name: "Danish", nativeName: "Dansk" },
  { code: "no-NO", name: "Norwegian", nativeName: "Norsk" },
  { code: "fi-FI", name: "Finnish", nativeName: "Suomi" },
  { code: "cs-CZ", name: "Czech", nativeName: "Čeština" },
  { code: "hu-HU", name: "Hungarian", nativeName: "Magyar" },
  { code: "ro-RO", name: "Romanian", nativeName: "Română" },
  { code: "el-GR", name: "Greek", nativeName: "Ελληνικά" },
  { code: "he-IL", name: "Hebrew", nativeName: "עברית" }
];

const DEFAULT_LANGUAGE: LanguageCode = "en-US";
const STORAGE_KEY = "northcrest.language";

function normalizeLanguage(language: string): LanguageCode | null {
  const normalized = language
    .trim()
    .toLowerCase()
    .replace("_", "-");

  const exact = LANGUAGES.find(
    (item) => item.code.toLowerCase() === normalized
  );

  if (exact) {
    return exact.code;
  }

  const base = normalized.split("-")[0];

  const matching = LANGUAGES.find(
    (item) => item.code.toLowerCase().startsWith(`${base}-`)
  );

  return matching?.code ?? null;
}

export function detectSystemLanguage(): LanguageCode {
  if (typeof navigator === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const languages = [
    ...(navigator.languages ?? []),
    navigator.language
  ];

  for (const language of languages) {
    if (!language) {
      continue;
    }

    const detected = normalizeLanguage(language);

    if (detected) {
      return detected;
    }
  }

  return DEFAULT_LANGUAGE;
}

export function getSavedLanguage(): LanguageCode | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return null;
    }

    return normalizeLanguage(saved);
  } catch {
    return null;
  }
}

export function getInitialLanguage(): LanguageCode {
  return getSavedLanguage() ?? detectSystemLanguage();
}

export function saveLanguage(language: LanguageCode): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Le launcher continue même si localStorage est indisponible.
  }
}

export function getLanguage(code: LanguageCode): Language {
  return (
    LANGUAGES.find((language) => language.code === code) ??
    LANGUAGES.find((language) => language.code === DEFAULT_LANGUAGE)!
  );
}

export function applyLanguage(language: LanguageCode): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = language;

  document.documentElement.dir =
    language === "ar-SA" || language === "he-IL"
      ? "rtl"
      : "ltr";
}

export function setLanguage(language: LanguageCode): void {
  saveLanguage(language);
  applyLanguage(language);
}

export function getLanguageName(language: LanguageCode): string {
  return getLanguage(language).nativeName;
}
