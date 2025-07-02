import { component$, useComputed$, useContext, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { DocumentHead, useLocation } from "@builder.io/qwik-city";
import { Button, Link, Pagination, Select, Spinner } from "flowbite-qwik";
import { Card } from "~/components/card";
import { Search } from "~/components/search";
import { LangContext } from "~/context/lang";
import { getDataTable } from "~/core/data_table";
import { IDataTable } from "~/core/data_table/interface";
import { DT_Item } from "~/core/data_table/item/item";
import { ItemMetadata, itemManager } from "~/core/item_manager";

export default component$(() => {
  const params = useLocation().url.searchParams;
  const lang = useContext(LangContext);
  const search = {
    bind: useSignal(""),
    debounced: useSignal(""),
  };
  const filterGenre = useSignal(params.get("genre") || "");
  const filterCategory = useSignal(params.get("category") || "");
  const filterBrand = useSignal(params.get("brand") || "");
  const table = useSignal<IDataTable<DT_Item> | undefined>();
  const currentPage = useSignal(1);
  const itemPerPage = 50;
  useVisibleTask$(async () => {
    if (!table.value) {
      const itemTable = await getDataTable("item");
      table.value = itemTable;
    }
  });
  const items = useComputed$(() => {
    const DT_Item = table.value;
    if (!DT_Item || !lang.value) {
      return [];
    }
    return Object.keys(DT_Item.Rows).map((id) => itemManager.getItemMetadata(id, DT_Item, lang));
  });
  const filteredItems = useComputed$(() => {
    if (items.value.length === 0) {
      return [];
    }
    const filtered = items.value.filter(
      (item) =>
        item.name.toLowerCase().includes(search.debounced.value.toLowerCase()) &&
        (filterGenre.value === "" || item.genre?.id === filterGenre.value) &&
        (filterCategory.value === "" || item.category?.id === filterCategory.value) &&
        (filterBrand.value === "" || item.brand?.id === filterBrand.value),
    );
    if (filtered.length > 0 && Math.ceil(filtered.length / itemPerPage) < currentPage.value) {
      currentPage.value = 1;
    }
    return filtered;
  });
  const maxPage = useComputed$(() => Math.ceil(filteredItems.value.length / itemPerPage));
  const slicedItems = useComputed$(() => {
    return filteredItems.value.slice((currentPage.value - 1) * itemPerPage, currentPage.value * itemPerPage);
  });
  const options = useComputed$(() => {
    const base = [{ value: "", name: "-" }];
    const genre = [...base];
    const category = [...base];
    const brand = [...base];
    for (const item of items.value) {
      if (item.genre && !genre.some((opt) => opt.value === item.genre.id)) {
        genre.push({ value: item.genre.id, name: item.genre.name });
      }
      if (item.category && !category.some((opt) => opt.value === item.category.id)) {
        category.push({ value: item.category.id, name: item.category.name });
      }
      if (item.brand && !brand.some((opt) => opt.value === item.brand.id)) {
        brand.push({ value: item.brand.id, name: item.brand.name });
      }
    }
    return {
      genre: genre.sort((a, b) => a.name.localeCompare(b.name)),
      category: category.sort((a, b) => a.name.localeCompare(b.name)),
      brand: brand.sort((a, b) => a.name.localeCompare(b.name)),
    };
  });

  return (
    <>
      {items.value.length > 0 ? (
        <>
          <div class="flex flex-col items-center justify-between mb-4">
            <h1 class="text-4xl font-bold">Items</h1>
          </div>
          <div class="mb-4 flex flex-row gap-2 lg:w-4xl items-end">
            <Search bind={search.bind} debouncedValue={search.debounced} placeholder="Search items..." class="flex-1" />
            <Select label="Genre" bind:value={filterGenre} options={options.value.genre} />
            <Select label="Category" bind:value={filterCategory} options={options.value.category} />
            <Select label="Brand" bind:value={filterBrand} options={options.value.brand} />
            <Button
              color="red"
              disabled={!search.bind.value && !filterGenre.value && !filterCategory.value && !filterBrand.value}
              outline
              onClick$={() => {
                search.bind.value = "";
                filterGenre.value = "";
                filterCategory.value = "";
                filterBrand.value = "";
                currentPage.value = 1;
              }}
            >
              Reset
            </Button>
          </div>
          <div class="mb-4 w-md flex items-center h-12">
            <h1 class="text-sm mr-2">
              Page {currentPage.value} of {maxPage.value}
            </h1>
            {maxPage.value > 1 && (
              <Pagination totalPages={maxPage.value} currentPage={currentPage} showIcons key="refresh" />
            )}
          </div>
          <div class="grid gap-4 grid-cols-[repeat(auto-fit,300px)]">
            {slicedItems.value.map((item) => (
              <Item {...item} key={item.id} />
            ))}
          </div>
        </>
      ) : (
        <div class="flex items-center">
          <Spinner color="purple" />
          <span class="ml-2">Loading data...</span>
        </div>
      )}
    </>
  );
});

const Item = component$<ItemMetadata>(({ imageSrc, name, id }) => {
  return (
    <Link href={`/items/${id}`} class="no-underline">
      <button class="h-full w-full text-white">
        <Card class="flex flex-col items-center justify-center cursor-pointer h-full">
          <div
            class="flex-shrink-0 w-32 h-32 bg-cover bg-center bg-no-repeat rounded mx-auto"
            style={`background-image: url(${imageSrc})`}
          ></div>
          <p class="mt-2 text-center text-md flex-1 flex items-center justify-center">{name}</p>
        </Card>
      </button>
    </Link>
  );
});

export const head: DocumentHead = {
  title: "Items - Mihoshi Habaki",
  meta: [
    {
      name: "description",
      content: "Browse and search items in Rune Factory: Guardians of Azuma.",
    },
  ],
};
