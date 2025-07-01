export enum Language {
  DE = "de",
  EN = "en",
  ES = "es",
  FR = "fr",
  JA = "ja",
  ZH_HANS = "zh-Hans",
  ZH_HANT = "zh-Hant",
}

export enum LanguageTL {
  DE = "Deutsch",
  EN = "English",
  ES = "Español",
  FR = "Français",
  JA = "日本語",
  ZH_HANS = "简体中文",
  ZH_HANT = "繁體中文",
}

const _language = {} as Record<Language, Record<string, Record<string, string>>>;
export const language = Object.freeze({
  get: async (lang: Language) => {
    if (!_language[lang]) {
      const json: Record<string, Record<string, string>> = await (
        await fetch(`/Game/Localization/${lang}.json`)
      ).json();
      _language[lang] = json;
    }
    return _language[lang];
  },
});
