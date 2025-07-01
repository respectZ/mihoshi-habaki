import { $, component$, Slot, useContext, useOnDocument, useSignal } from "@builder.io/qwik";
import { LuGithub, LuGlobe } from "@qwikest/icons/lucide";
import { Link } from "flowbite-qwik";
import { LangContext } from "~/context/lang";
import { language, Language, LanguageTL } from "~/core/lang";

export const Header = component$(() => {
  return (
    <header>
      <nav class="h-16 bg-zinc-950 flex items-center justify-between px-4">
        <HeaderItem>
          <Link href="/" class="hover:underline">
            <p class="text-white">Mihoshi Habaki</p>
          </Link>
        </HeaderItem>
        <div class="flex items-center gap-4">
          <RightItems />
        </div>
      </nav>
    </header>
  );
});

const HeaderItem = component$(() => {
  return (
    <div class="cursor-pointer hover:scale-105 transition-transform duration-150 ease-out">
      <Slot />
    </div>
  );
});

export const RightItems = component$(() => {
  const visible = useSignal(false);
  const toggleVisibility = $(() => {
    visible.value = !visible.value;
  });

  const lang = useContext(LangContext);
  const langItems: Record<Language, { key: string; label: string }> = {
    de: {
      key: Language.DE,
      label: LanguageTL.DE,
    },
    en: {
      key: Language.EN,
      label: LanguageTL.EN,
    },
    es: {
      key: Language.ES,
      label: LanguageTL.ES,
    },
    ja: {
      key: Language.JA,
      label: LanguageTL.JA,
    },
    fr: {
      key: Language.FR,
      label: LanguageTL.FR,
    },
    "zh-Hans": {
      key: Language["ZH_HANS"],
      label: LanguageTL["ZH_HANS"],
    },
    "zh-Hant": {
      key: Language["ZH_HANT"],
      label: LanguageTL["ZH_HANT"],
    },
  };
  const switchLanguage = $(async (newLanguage: Language) => {
    visible.value = false;
    if (lang.isLoading || lang.currentLang === newLanguage) {
      return;
    }
    lang.value = await language.get(newLanguage);
    lang.currentLang = newLanguage;
    localStorage.setItem("mihoshi-lang", newLanguage);
  });

  const ref = useSignal<HTMLElement | undefined>(undefined);
  useOnDocument(
    "click",
    $((event) => {
      if (!ref.value) {
        return;
      }
      const target = event.target as HTMLElement;
      if (!ref.value.contains(target)) {
        visible.value = false;
      }
    }),
  );

  return (
    <div class="grid grid-cols-2 gap-4 relative" key="rih">
      <button>
        <HeaderItem>
          <Link href="https://github.com/respectZ/mihoshi-habaki" class="flex flex-row items-center">
            <LuGithub class="mr-2" />
            <p class="text-white">Github</p>
          </Link>
        </HeaderItem>
      </button>
      <HeaderItem>
        <button class="flex flex-row items-center cursor-pointer" onClick$={toggleVisibility}>
          <LuGlobe class="mr-2" />
          Language
        </button>
      </HeaderItem>
      <div
        class={`absolute right-0 mt-10 w-48 bg-zinc-950 rounded-md shadow-lg z-10 ${visible.value ? "block" : "hidden"}`}
        ref={ref}
      >
        <div class="flex flex-col">
          {Object.values(langItems).map((item) => (
            <button
              key={item.key}
              class={
                `cursor-pointer block px-4 py-2 hover:bg-white hover:text-black w-full text-left ` +
                (lang.currentLang === item.key ? "bg-purple-600" : "")
              }
              onClick$={() => switchLanguage(item.key as Language)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
