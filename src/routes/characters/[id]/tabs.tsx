import { component$, Signal, useContext, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { Image } from "@unpic/qwik";
import { Badge, Link, Tabs } from "flowbite-qwik";
import { Observer } from "~/components/observer";
import { TextShadow } from "~/components/text_shadow";
import { LangContext } from "~/context/lang";
import { CommunicationPickyType } from "~/core/enum/comunication_picky_type";
import { ReactionType } from "~/core/enum/reaction_type";
import { itemManager, ItemMetadata } from "~/core/item_manager";
import { DataTableContext } from ".";
import { CharacterData, DataTableSignal } from "../../../core/character_manager";
import { CharacterProfile } from "./profile";

type CharacterTabProps = {
  bind: Signal<string>;
  texts: Record<CharacterTabKeys, string>;
  data: CharacterData;
  dataTable: DataTableSignal;
};
export type CharacterTabKeys = "profile" | "preferences" | "communication" | "gifts" | "quests";
export const CharacterTabs = component$<CharacterTabProps>(({ bind, data, texts }) => {
  const store = useStore<{
    [key in CharacterTabKeys]: Signal<boolean>;
  }>({
    profile: useSignal<boolean>(false),
    preferences: useSignal<boolean>(false),
    communication: useSignal<boolean>(false),
    gifts: useSignal<boolean>(false),
    quests: useSignal<boolean>(false),
  });
  useVisibleTask$(({ track }) => {
    track(() => [
      store.profile.value,
      store.preferences.value,
      store.communication.value,
      store.gifts.value,
      store.quests.value,
    ]);
    if (store.profile.value) {
      bind.value = "profile";
    } else if (store.preferences.value) {
      bind.value = "preferences";
    } else if (store.communication.value) {
      bind.value = "communication";
    } else if (store.gifts.value) {
      bind.value = "gifts";
    } else if (store.quests.value) {
      bind.value = "quests";
    }
  });

  return (
    <Tabs variant="underline" key={texts.profile}>
      <Tabs.Tab title={texts.profile}>
        <Observer bind={store.profile} />
        <CharacterProfile profile={data.profile} desc={data.desc} />
      </Tabs.Tab>
      <Tabs.Tab title={texts.preferences}>
        <Observer bind={store.preferences} />
        <CharacterTabPreferences data={data} />
      </Tabs.Tab>
      <Tabs.Tab title={texts.communication}>
        <Observer bind={store.communication} />
        <CharacterTabCommunication />
      </Tabs.Tab>
      <Tabs.Tab title={texts.gifts} disabled>
        <Observer bind={store.gifts} />
      </Tabs.Tab>
      <Tabs.Tab title={texts.quests} disabled>
        <Observer bind={store.quests} />
      </Tabs.Tab>
    </Tabs>
  );
});

type CharacterTabPreferencesProps = {
  data: CharacterData;
};
const CharacterTabPreferences = component$<CharacterTabPreferencesProps>(({ data }) => {
  const characterId = data.id;
  const lang = useContext(LangContext);
  const dataTable = useContext(DataTableContext);
  const pickyItems = useStore<Record<CommunicationPickyType, ItemMetadata[]>>({
    LOVE: [],
    LIKE: [],
    DISLIKE: [],
    HATE: [],
  });
  useVisibleTask$(({ track }) => {
    track(() => [dataTable.DT_Item.value, dataTable.DT_NpcPickyItem.value, lang.currentLang, lang.value]);
    const DT_Item = dataTable.DT_Item.value;
    const DT_NpcPickyItem = dataTable.DT_NpcPickyItem.value;
    if (!DT_Item || !DT_NpcPickyItem || !lang.value) {
      return;
    }
    for (const type of Object.values(CommunicationPickyType) as CommunicationPickyType[]) {
      const itemKey = `${characterId}_${type}`;
      const items = DT_NpcPickyItem.Rows[itemKey]?.ItemIdArray;
      if (!items || !items.length) {
        return;
      }
      pickyItems[type] = items.map((itemId) => itemManager.getItemMetadata(itemId, DT_Item, lang));
    }
  });
  return (
    <>
      <div class="grid sm:grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(384px,1fr))] gap-4">
        {Object.entries(pickyItems).map(([type, items], index) => {
          const src = `/Game/Senbei/UI/Textures/T_UI_menu_profile_title_${index.toString().padStart(2, "0")}.png`;
          const typeLang = lang.value?.["ST_Communication"][`TXT_COM_${type}`] || type;
          return (
            <div key={type} class="w-sm">
              <div class="relative w-full h-[116px]">
                <div class="absolute top-0 left-0 w-[320px] h-[116px]">
                  <Image draggable="false" width={320} height={116} src={src} />
                </div>
                <div class="absolute top-10 left-4 w-[280px] h-[32px] flex items-center justify-center">
                  <TextShadow>
                    <h1 class="text-2xl font-bold text-center">{typeLang}</h1>
                  </TextShadow>
                </div>
              </div>
              {items.map(({ name, imageSrc, id }, index) => (
                <Link key={index} href={`/items/${id}`} underline={false}>
                  <div class="flex items-center mb-2 hover:scale-105 transition-transform ease-out duration-150 text-white">
                    <Image draggable="false" width={48} height={48} src={imageSrc} class="mr-2" />
                    <span class="text-lg">{name}</span>
                  </div>
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
});

type CommandData = {
  text: string;
  level: number;
  exp: number;
};
const CharacterTabCommunication = component$(() => {
  const lang = useContext(LangContext);
  const dataTable = useContext(DataTableContext);
  const communication = useStore<Record<ReactionType, Array<CommandData>>>({
    LOVE: [],
    LIKE: [],
    DISLIKE: [],
    HATE: [],
    NEUTRAL: [],
  });
  useVisibleTask$(({ track }) => {
    track(() => [
      dataTable.DA_CommunicationNpc.value,
      dataTable.DA_CommunicationNpc.value,
      lang.currentLang,
      lang.value,
    ]);
    const table = dataTable.DA_CommunicationNpc.value;
    const communicationCommand = dataTable.DT_CommunicationCommand.value;
    if (!lang.value || !table || !communicationCommand) {
      return;
    }
    const commandPreference = table.Properties.CommandPreference;
    for (const item of commandPreference) {
      const cmd = communicationCommand.Rows[item.Key];
      const reaction = ReactionType[item.Value.split("::")[1] as keyof typeof ReactionType];
      if (!cmd) {
        continue;
      }
      const cmdKey = cmd.ComuunicationCommandTextKeyData.Key;
      const text = lang.value?.["ST_Communication"][cmdKey] || cmdKey;
      communication[reaction] = communication[reaction] || [];
      communication[reaction].push({
        text,
        level: cmd.TextCommunicationLevel,
        exp: cmd.DefaultFriendshipExp,
      });
    }
    Object.entries(communication).forEach(([reaction, commands]) => {
      communication[reaction as ReactionType] = commands.sort(
        (a, b) => a.level - b.level || a.text.localeCompare(b.text),
      );
    });
  });
  const size = Object.keys(communication).length;
  return (
    <>
      <p class="mb-4 text-sm">*Experience points shown don't include reaction multipliers.</p>
      <div class="grid sm:grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(384px,1fr))] gap-4">
        {Object.entries(communication).map(([reaction, commands], index) => {
          const src = `/Game/Senbei/UI/Textures/T_UI_menu_profile_title_${index.toString().padStart(2, "0")}.png`;
          const typeLang = lang.value?.["ST_Communication"][`TXT_COM_${reaction}`] || reaction;
          return (
            <div key={reaction} class="w-sm">
              <div class="relative w-full h-[116px]">
                <div class={`absolute ${index === size - 1 ? "top-[29px]" : "top-0"} left-0 w-[320px] h-[116px]`}>
                  <Image draggable="false" width={320} height={116} src={src} />
                </div>
                <div class="absolute top-10 left-4 w-[280px] h-[32px] flex items-center justify-center">
                  <TextShadow>
                    <h1 class="text-2xl font-bold text-center">{typeLang}</h1>
                  </TextShadow>
                </div>
              </div>
              <div>
                {commands.map(({ exp, level, text }, index) => (
                  <div key={index} class="mb-2 flex flex-row items-center">
                    <div class="relative w-16 h-16 mr-2">
                      <div class="absolute top-0 left-0">
                        <Image
                          draggable="false"
                          width={64}
                          height={64}
                          src="/Game/Senbei/UI/Textures/T_UI_event_friendship_03.png"
                          class="mr-2"
                        />
                      </div>
                      <div class="absolute top-4 left-0 w-16 h-16 flex flex-col items-center justify-start leading-none">
                        <TextShadow>
                          <span class="text-sm text-white leading-none">Lv.</span>
                        </TextShadow>
                        <TextShadow>
                          <span class="text-lg text-white leading-none">{level}</span>
                        </TextShadow>
                      </div>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-lg">{text}</span>
                      <div class="self-start">
                        <Badge bordered type="yellow" content={`${exp} EXP`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
});
