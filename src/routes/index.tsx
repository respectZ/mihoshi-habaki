import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Button, Link } from "flowbite-qwik";

export default component$(() => {
  return (
    <>
      <div class="flex-1 flex flex-col items-center justify-center h-full w-full gap-4">
        <div>
          <h1 class="text-4xl font-bold">Rune Factory: Guardians of Azuma Interactive Database</h1>
          <p class="text-lg text-gray-100 mt-4">Explore database</p>
          <div class="flex justify-baseline gap-4 mt-4">
            <Link href="/items">
              <Button color="purple" size="lg">
                Items
              </Button>
            </Link>
            <Link href="/characters">
              <Button color="purple" size="lg">
                Characters
              </Button>
            </Link>
            <Button color="purple" size="lg" disabled>
              Monsters
            </Button>
          </div>
          <p class="text-lg text-gray-100 mt-4">Cheat Sheets</p>
          <div class="flex justify-baseline gap-4 mt-4">
            <Button color="purple" size="lg" disabled>
              Characters
            </Button>
            <Button color="purple" size="lg" disabled>
              Monsters
            </Button>
          </div>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Mihoshi Habaki",
  meta: [
    {
      name: "description",
      content: "Mihoshi Habaki - Rune Factory: Guardians of Azuma Interactive Database",
    },
  ],
};
