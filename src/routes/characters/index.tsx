import { component$, Slot, useComputed$, useContext, useStore, useVisibleTask$ } from "@builder.io/qwik";
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
  });
  const characters = useComputed$(() => {
    if (!dataTable.loaded || !lang.value) {
      return {};
    }
    const DT_Character = dataTable.DT_Character;
    const DT_Profile = dataTable.DT_Profile;
    if (!DT_Character || !DT_Profile) {
      return {};
    }
    const regex = /[WL]NPC(\d+)/;
    return Object.keys(DT_Character.Rows).reduce(
      (acc, id) => {
        const matches = regex.exec(id);
        if (!matches) {
          return acc;
        }
        // 12 = Sorano
        // > 27 = Non-Interactable NPCs
        const characterId = +matches[1];
        if (characterId === 12 || characterId > 32) {
          return acc; // Skip Sorano and non-interactable NPCs
        }
        const residence = residenceManager.getVillagerResidence(id);
        const data = characterManager.getData(id, dataTable, lang);
        acc[residence] = acc[residence] || [];
        acc[residence].push(data);
        return acc;
      },
      {
        spring: [],
        summer: [],
        autumn: [],
        winter: [],
        unknown: [],
      } as Record<Residence, CharacterData[]>,
    );
  });
  const entries = Object.entries(characters.value) as [Residence, CharacterData[]][];
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
