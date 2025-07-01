import { createContextId } from "@builder.io/qwik";
import { Language } from "~/core/lang";

export const LangContext = createContextId<LangContextType>("lang");

export type LangContextType = {
  value: Record<string, Record<string, string>> | null;
  currentLang: Language;
  isLoading: boolean;
};
