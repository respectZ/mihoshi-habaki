import { component$, Slot, useContextProvider, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { Header } from "~/components/header";
import { LangContext, LangContextType } from "~/context/lang";
import { Language, language } from "~/core/lang";

export default component$(() => {
  const lang = useStore<LangContextType>({
    value: null,
    currentLang: Language.EN, // Default language
    isLoading: true,
  });
  useContextProvider(LangContext, lang);
  useVisibleTask$(async () => {
    const defaultLang = localStorage.getItem("mihoshi-lang");
    if (defaultLang) {
      lang.value = await language.get(defaultLang as Language);
      lang.currentLang = defaultLang as Language;
    } else {
      lang.value = await language.get(Language.EN);
    }
    lang.isLoading = false;
  });
  return (
    <div class="min-h-screen flex flex-col text-white">
      <Header />
      <main class="bg-zinc-900 flex-1 p-4 flex flex-col">
        <Slot />
      </main>
    </div>
  );
});
