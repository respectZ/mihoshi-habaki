import {
  component$,
  createContextId,
  useComputed$,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { DocumentHead, useDocumentHead, useLocation } from "@builder.io/qwik-city";
import { Image } from "@unpic/qwik";
import { Badge, Breadcrumb, Link, Spinner } from "flowbite-qwik";
import { LangContext } from "~/context/lang";
import { CharacterData, DataTableSignal, characterManager } from "~/core/character_manager";
import { getDataTable } from "~/core/data_table";
import { getCharacterCommunication } from "~/core/data_table/character_communication";
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
  const visibleTab = useSignal<CharacterTabKeys>("profile");
  const dataTable = useStore<DataTableSignal>(
    {
      loaded: false,
      DT_Character: undefined,
      DT_Profile: undefined,
      DT_NpcPickyItem: undefined,
      DT_Item: undefined,
      DT_CommunicationCommand: undefined,
      DA_CommunicationNpc: undefined,
    },
    { deep: false },
  );
  useContextProvider(DataTableContext, dataTable);
  useVisibleTask$(async ({ track }) => {
    track(() => dataTable.loaded);
    if (dataTable.loaded) {
      return;
    }
    if (!dataTable.DT_Character) {
      dataTable.DT_Character = await getDataTable("character");
    }
    if (!dataTable.DT_Profile) {
      dataTable.DT_Profile = await getDataTable("characterProfile");
    }
    dataTable.loaded = true;
    console.log("DataTable loaded");
  });
  // Separate NpcPickyItem loading, load once the preferences tab is visible
  useVisibleTask$(async ({ track }) => {
    track(() => visibleTab.value);
    if (visibleTab.value !== "preferences") {
      return;
    }
    if (!dataTable.DT_NpcPickyItem) {
      dataTable.DT_NpcPickyItem = await getDataTable("npcPickyItem");
    }
    if (!dataTable.DT_Item) {
      dataTable.DT_Item = await getDataTable("item");
    }
  });
  // Separate CommunicationNpc loading, load once the communication tab is visible
  useVisibleTask$(async ({ track }) => {
    track(() => visibleTab.value);
    if (visibleTab.value !== "communication") {
      return;
    }
    if (!dataTable.DT_CommunicationCommand) {
      dataTable.DT_CommunicationCommand = await getDataTable("communicationCommand");
    }
    if (!dataTable.DA_CommunicationNpc) {
      const data = await getCharacterCommunication(characterId.slice(3));
      if (data) {
        dataTable.DA_CommunicationNpc = data;
      }
    }
  });
  const characterData = useComputed$(() => {
    if (!dataTable.loaded || !lang.value) {
      return -1;
    }
    try {
      const data = characterManager.getData(characterId, dataTable, lang);
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
      return {
        ...data,
        badges,
      } satisfies CharacterProps;
    } catch {
      return 0;
    }
  });
  useTask$(({ track }) => {
    track(() => characterData.value);
    if (typeof characterData.value === "object") {
      // @ts-expect-error: read-only property. Hack way to dynamically set the title
      head.title = `${characterData.value.name} - Mihoshi Habaki`;
    }
  });

  const tabTexts = useComputed$(() => {
    if (!lang.value) {
      return {
        profile: "Profile",
        preferences: "Preferences",
        communication: "Communication",
        gifts: "Gifts",
        quests: "Quests",
      };
    }
    return {
      profile: lang.value["ST_Menu"]["TXT_CMP_CHR001"] || "Profile",
      preferences: lang.value["ST_Menu"]["TXT_CMP_CHR002"] || "Preferences",
      communication: lang.value["ST_Menu"]["TXT_CMP_SKL018"] || "Communication",
      gifts: lang.value["ST_Menu"]["TXT_CMP_CHR003"] || "Gifts",
      quests: lang.value["ST_Quest"]["TXT_QST_MIT004"] || "Quests",
    };
  });

  if (characterData.value === -1) {
    return (
      <div class="flex items-center">
        <Spinner color="purple" />
        <span class="ml-2">Loading character data...</span>
      </div>
    );
  }
  if (characterData.value === 0) {
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
      <CharacterTabs bind={visibleTab} texts={tabTexts} data={characterData.value} dataTable={dataTable} />
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
