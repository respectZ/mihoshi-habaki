import {
  component$,
  createContextId,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { DocumentHead, useDocumentHead, useLocation } from "@builder.io/qwik-city";
import { Image } from "@unpic/qwik";
import { Badge, Breadcrumb, Link, Spinner } from "flowbite-qwik";
import { LangContext } from "~/context/lang";
import { CharacterData, DataTableSignal, characterManager } from "~/core/character_manager";
import { getDataTable } from "~/core/data_table";
import { DA_CommunicationNpc, getCharacterCommunication } from "~/core/data_table/character_communication";
import { DT_CommunicationCommand } from "~/core/data_table/communication/communication_command";
import { DT_NpcPickyItem } from "~/core/data_table/communication/picky_item";
import { IDataTable } from "~/core/data_table/interface";
import { DT_Item } from "~/core/data_table/item/item";
import { Residence } from "~/core/residence_manager";
import { CharacterTabKeys, CharacterTabs } from "./tabs";

type CharacterProps = CharacterData & {
  badges?: Array<Parameters<typeof Badge>[0]>;
};
const residenceColors: Record<Residence, Parameters<typeof Badge>[0]["type"]> = {
  spring: "pink",
  summer: "green",
  autumn: "yellow",
  winter: "blue",
  unknown: "default",
};
export const DataTableContext = createContextId<DataTableSignal>("DataTableContext");

export default component$(() => {
  const loc = useLocation();
  const head = useDocumentHead();
  const characterId = loc.params.id;
  const lang = useContext(LangContext);
  const isError = useSignal<boolean>(false);
  const visibleTab = useSignal<CharacterTabKeys>("profile");
  const tabTexts = useStore({
    profile: "Profile",
    preferences: "Preferences",
    communication: "Communication",
    gifts: "Gifts",
    quests: "Quests",
  });
  const dataTable = useSignal<DataTableSignal>({
    loaded: false,
    DT_Character: undefined,
    DT_Profile: undefined,
    DT_NpcPickyItem: useSignal<IDataTable<DT_NpcPickyItem> | undefined>(),
    DT_Item: useSignal<IDataTable<DT_Item> | undefined>(),
    DT_CommunicationCommand: useSignal<IDataTable<DT_CommunicationCommand> | undefined>(),
    DA_CommunicationNpc: useSignal<DA_CommunicationNpc | undefined>(),
  });
  useContextProvider(DataTableContext, dataTable.value);
  const characterData = useSignal<CharacterProps | null>(null);
  useVisibleTask$(async ({ track }) => {
    track(() => dataTable.value.loaded);
    if (dataTable.value.loaded) {
      return;
    }
    if (!dataTable.value.DT_Character) {
      dataTable.value.DT_Character = await getDataTable("character");
    }
    if (!dataTable.value.DT_Profile) {
      dataTable.value.DT_Profile = await getDataTable("characterProfile");
    }
    dataTable.value.loaded = true;
  });
  // Separate NpcPickyItem loading, load once the preferences tab is visible
  useVisibleTask$(async ({ track }) => {
    track(() => visibleTab.value);
    if (visibleTab.value !== "preferences") {
      return;
    }
    if (!dataTable.value.DT_NpcPickyItem.value) {
      dataTable.value.DT_NpcPickyItem.value = await getDataTable("npcPickyItem");
    }
    if (!dataTable.value.DT_Item.value) {
      dataTable.value.DT_Item.value = await getDataTable("item");
    }
  });
  // Separate CommunicationNpc loading, load once the communication tab is visible
  useVisibleTask$(async ({ track }) => {
    track(() => visibleTab.value);
    if (visibleTab.value !== "communication") {
      return;
    }
    if (!dataTable.value.DT_CommunicationCommand.value) {
      dataTable.value.DT_CommunicationCommand.value = await getDataTable("communicationCommand");
    }
    if (!dataTable.value.DA_CommunicationNpc.value) {
      const data = await getCharacterCommunication(characterId.slice(3));
      if (data) {
        dataTable.value.DA_CommunicationNpc.value = data;
      }
    }
  });
  useVisibleTask$(async ({ track }) => {
    track(() => [dataTable.value.loaded, lang.currentLang, lang.value]);
    if (!dataTable.value.loaded || !lang.value) {
      return;
    }
    try {
      const data = characterManager.getData(characterId, dataTable.value, lang);
      // @ts-expect-error: read-only property. Hack way to dynamically set the title
      head.title = `${data.name} - Mihoshi Habaki`;
      // Badges
      const badges: CharacterProps["badges"] = [];
      const residenceBadge = {
        bordered: true,
        type: residenceColors[data.residence.id],
        content: data.residence.text,
      } satisfies Parameters<typeof Badge>[0];
      badges.push(residenceBadge);
      if (data.isMarriageCandidate) {
        badges.push({
          bordered: true,
          type: "pink",
          content: "Marriage Candidate",
        });
      }
      characterData.value = data;
      characterData.value.badges = badges;
    } catch {
      isError.value = true;
    }
  });
  useVisibleTask$(({ track }) => {
    track(() => [lang.currentLang, lang.value]);
    if (!lang.value) {
      return;
    }
    tabTexts.profile = lang.value["ST_Menu"]["TXT_CMP_CHR001"];
    tabTexts.preferences = lang.value["ST_Menu"]["TXT_CMP_CHR002"];
    tabTexts.communication = lang.value["ST_Menu"]["TXT_CMP_SKL018"];
    // TODO: Translate gifts tab text
    // tabTexts.gifts = lang.value["ST_Menu"]["TXT_CMP_CHR003"];
    tabTexts.quests = lang.value["ST_Quest"]["TXT_QST_MIT004"];
  });

  if (isError.value) {
    return (
      <>
        <div class="flex items-center">
          <span class="text-red-500">Character not found.</span>
        </div>
        <p>
          Click <Link href="/characters">here</Link> to go back to the character list.
        </p>
      </>
    );
  }
  if (!characterData.value) {
    return (
      <div class="flex items-center">
        <Spinner color="purple" />
        <span class="ml-2">Loading character data...</span>
      </div>
    );
  }
  return (
    <>
      <div class="mb-4">
        <Breadcrumb>
          <Breadcrumb.Item home href="/">
            Home
          </Breadcrumb.Item>
          <Breadcrumb.Item href="/characters">Characters</Breadcrumb.Item>
          <Breadcrumb.Item>{characterData.value.name}</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div class="flex flex-row">
        <Image class="rounded-lg" src={characterData.value.imageSrc} width={128} height={128} />
        <div class="flex flex-col justify-center ml-4">
          <h1 class="text-4xl font-bold">{characterData.value.name}</h1>
          <h2 class="text-2xl text-gray-200">{characterData.value.alias}</h2>
          {characterData.value.badges && (
            <div class="flex flex-row mt-2">
              {characterData.value.badges.map((data, index) => (
                <Badge key={index} {...data} />
              ))}
            </div>
          )}
        </div>
      </div>
      <CharacterTabs bind={visibleTab} texts={tabTexts} data={characterData.value} dataTable={dataTable.value} />
    </>
  );
});

export const head: DocumentHead = {
  title: "Character Details - Mihoshi Habaki",
  meta: [
    {
      name: "description",
      content: "Details about the Rune Factory: Guardians of Azuma character.",
    },
  ],
};
