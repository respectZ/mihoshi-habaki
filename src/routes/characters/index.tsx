import { component$, Slot, useContext, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";
import { Image } from "@unpic/qwik";
import { Breadcrumb, Link, Spinner } from "flowbite-qwik";
import { Card } from "~/components/card";
import { LangContext } from "~/context/lang";
import { CharacterData, characterManager, DataTableSignal } from "~/core/character_manager";
import { getDataTable } from "~/core/data_table";
import { Residence, residenceManager } from "../../core/residence_manager";

export default component$(() => {
  const lang = useContext(LangContext);
  const dataTable = useSignal<DataTableSignal>({
    loaded: false,
    DT_Character: undefined,
    DT_Profile: undefined,
    DT_NpcPickyItem: useSignal(undefined),
    DT_Item: useSignal(undefined),
    DT_CommunicationCommand: useSignal(undefined),
    DA_CommunicationNpc: useSignal(undefined),
  });
  const characters = useStore<Record<Residence, CharacterData[]>>({
    spring: [],
    summer: [],
    autumn: [],
    winter: [],
    unknown: [],
  });
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
  useVisibleTask$(({ track }) => {
    track(() => [dataTable.value.loaded, lang.currentLang, lang.value]);
    if (!dataTable.value.loaded || !lang.value) {
      return;
    }
    const DT_Character = dataTable.value.DT_Character;
    const DT_Profile = dataTable.value.DT_Profile;
    if (!DT_Character || !DT_Profile) {
      return;
    }
    // Reset characters
    for (const residence of Object.keys(characters) as Residence[]) {
      characters[residence] = [];
    }
    for (const [id] of Object.entries(DT_Character.Rows)) {
      const regex = /[WL]NPC(\d+)/g;
      const matches = regex.exec(id);
      if (!matches) {
        continue;
      }
      const characterId = +matches[1];
      // 12 = Sorano
      // > 27 = Non-Interactable NPCs
      if (characterId === 12 || characterId > 26) {
        continue;
      }
      const residence = residenceManager.getVillagerResidence(id);
      const data = characterManager.getData(id, dataTable.value, lang);
      characters[residence].push(data);
    }
  });
  const entries = Object.entries(characters) as [Residence, CharacterData[]][];
  return (
    <>
      <div class="mb-4">
        <Breadcrumb>
          <Breadcrumb.Item home href="/">
            Home
          </Breadcrumb.Item>
          <Breadcrumb.Item href="/characters">Characters</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      {/* Card */}
      {entries.length > 0 ? (
        entries.map(([residence, characterList]) => (
          <ResidenceMemo key={residence} residence={residence as Residence}>
            <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-[repeat(auto-fit,200px)] mb-4">
              {characterList.map((character) => (
                <CharacterCard key={character.id} data={character} />
              ))}
            </div>
          </ResidenceMemo>
        ))
      ) : (
        <div class="flex items-center">
          <Spinner color="purple" />
          <span class="ml-2">Loading character data...</span>
        </div>
      )}
    </>
  );
});

type ResidenceProps = {
  residence: Residence;
};
const ResidenceMemo = component$<ResidenceProps>(({ residence }) => {
  const lang = useContext(LangContext);
  const { imageSrc, index, text } = residenceManager.getData(residence, lang);
  return (
    <>
      <div class="flex flex-row mb-4">
        {index < 4 && <Image src={imageSrc} width={64} height={64} class="mr-4" />}
        <h1 class="text-4xl font-bold">{text}</h1>
      </div>
      <Slot />
    </>
  );
});

type CharacterCardProps = {
  data: CharacterData;
};
const CharacterCard = component$<CharacterCardProps>(({ data }) => {
  return (
    <Link href={`/characters/${data.id}`} class="no-underline">
      <button class="cursor-pointer text-white">
        <Card
          theme={{
            root: data.isMarriageCandidate && "from-rose-400/50 to-rose-50/0 bg-gradient-to-b",
          }}
        >
          <Image
            class="rounded-lg"
            draggable="false"
            layout="constrained"
            objectFit="fill"
            width={128}
            height={128}
            src={data.imageSrc}
          />
          <p class="mt-2 text-center text-md">{data.name}</p>
        </Card>
      </button>
    </Link>
  );
});

export const head: DocumentHead = {
  title: "Characters - Mihoshi Habaki",
  meta: [
    {
      name: "description",
      content: "List of characters in Rune Factory: Guardians of Azuma.",
    },
  ],
};
