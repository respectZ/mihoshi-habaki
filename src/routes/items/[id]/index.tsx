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
import { Badge, Breadcrumb, Hr, Link, Spinner, Table } from "flowbite-qwik";
import { LangContext } from "~/context/lang";
import { getDataTable } from "~/core/data_table";
import { IDataTable } from "~/core/data_table/interface";
import { DT_EqupimentParam } from "~/core/data_table/item/equipment_param";
import { DT_Item } from "~/core/data_table/item/item";
import { DT_RecipeParam } from "~/core/data_table/item/recipe_param";
import {
  BrandMetadata,
  EquipmentParameter,
  ItemMetadata,
  RecipeParameter,
  RecipeUsingThisItemResult,
  itemManager,
} from "~/core/item_manager";

type GenericData = {
  id: string;
  name: string;
  category: string;
  genre: string;
  sellable: boolean;
  baseSellingPrice: number;
  buyable: boolean;
  baseBuyingPrice: number;
};

type DataTable = {
  loaded: boolean;
  DT_Item?: IDataTable<DT_Item>;
  DT_EquipmentParam?: IDataTable<DT_EqupimentParam>;
  DT_RecipeParam?: IDataTable<DT_RecipeParam>;
};

type CachedBrandMetadata = BrandMetadata & {
  imageSrc?: string; // Optional, not always available
};

const CachedBrandMetadataContext = createContextId<Record<string, CachedBrandMetadata>>("CachedBrandMetadataContext");

export default component$(() => {
  const loc = useLocation();
  const head = useDocumentHead();
  const lang = useContext(LangContext);
  const itemId = loc.params.id;
  const isError = useSignal(false);
  const metadata = useSignal<ItemMetadata>();
  const genericTable = useSignal<GenericData>();
  const equipmentParameter = useSignal<EquipmentParameter>();
  const recipeParameter = useSignal<RecipeParameter>();
  const recipesUsingThisItem = useStore<RecipeUsingThisItemResult>([]);
  const dataTable = useStore<DataTable>({
    loaded: false,
  });
  const cachedBrandMetadata = useStore<Record<string, CachedBrandMetadata>>({});
  useContextProvider(CachedBrandMetadataContext, cachedBrandMetadata);
  // Load data tables when the component becomes visible
  useVisibleTask$(async ({ track }) => {
    track(() => dataTable.loaded);
    if (!dataTable.loaded) {
      dataTable.DT_Item = await getDataTable("item");
      dataTable.DT_EquipmentParam = await getDataTable("equipmentParam");
      dataTable.DT_RecipeParam = await getDataTable("recipeParam");
      dataTable.loaded = true;
    }
  });
  // Fetch item metadata and populate tables when data is loaded
  useVisibleTask$(async ({ track }) => {
    track(() => [
      dataTable.DT_Item,
      dataTable.DT_EquipmentParam,
      dataTable.DT_RecipeParam,
      lang.value,
      lang.currentLang,
    ]);
    const DT_Item = dataTable.DT_Item;
    const DT_EquipmentParam = dataTable.DT_EquipmentParam;
    const DT_RecipeParam = dataTable.DT_RecipeParam;
    if (!DT_Item || !lang.value) {
      return;
    }
    if (!DT_Item.Rows[itemId]) {
      console.error(`Item ID ${itemId} not found in DT_Item`);
      isError.value = true;
      return;
    }

    metadata.value = itemManager.getItemMetadata(itemId, DT_Item, lang);
    // @ts-expect-error: read-only property. Hack way to dynamically set the title
    head.title = `${metadata.value.name} - Mihoshi Habaki`;
    // Populate generic data table
    genericTable.value = {
      id: metadata.value.id,
      name: metadata.value.name,
      category: metadata.value.category.name,
      genre: metadata.value.genre.name,
      sellable: metadata.value.saleAllowed,
      baseSellingPrice: metadata.value.baseSellingPrice,
      buyable: metadata.value.buyAllowed,
      baseBuyingPrice: metadata.value.baseBuyingPrice,
    };
    // Populate equipment parameter if available
    if (DT_EquipmentParam) {
      const equipmentParam = itemManager.getEquipmentParameter(
        itemId,
        {
          DT_Item,
          DT_EquipmentParam,
        },
        lang,
      );
      if (equipmentParam) {
        equipmentParameter.value = equipmentParam;
      }
    }
    if (DT_RecipeParam) {
      // Populate recipe parameter if available
      const recipeParam = itemManager.getRecipeParameter(
        itemId,
        {
          DT_Item,
          DT_RecipeParam,
        },
        lang,
      );
      if (recipeParam) {
        recipeParameter.value = recipeParam;
      }
    }
  });
  // Fetch recipes using this item
  useVisibleTask$(async ({ track }) => {
    track(() => [dataTable.DT_RecipeParam, lang.value, lang.currentLang]);
    const DT_Item = dataTable.DT_Item;
    const DT_RecipeParam = dataTable.DT_RecipeParam;
    if (!DT_Item || !DT_RecipeParam || !lang.value) {
      return;
    }
    // Verify the item ID is valid
    if (!DT_Item.Rows[itemId]) {
      return;
    }
    recipesUsingThisItem.length = 0; // Clear previous results
    const dt = {
      DT_Item,
      DT_RecipeParam,
    };
    // TODO: Optimize this by changing first parameter into ItemMetadata
    const resultByItem = itemManager.findRecipesUsingItem(itemId, dt, lang);
    const brandId = DT_Item.Rows[itemId].ItemBrandId;
    if (brandId) {
      const resultByBrand = itemManager.findRecipesUsingItem(brandId, dt, lang);
      recipesUsingThisItem.push(...resultByBrand);
    }
    recipesUsingThisItem.push(...resultByItem);
  });
  // Cache brand metadata for quick access
  useVisibleTask$(({ track }) => {
    track(() => [dataTable.DT_Item, lang.value]);
    const DT_Item = dataTable.DT_Item;
    if (!DT_Item || !lang.value) {
      return;
    }
    for (const itemId in DT_Item.Rows) {
      const itemData = DT_Item.Rows[itemId];
      const brandId = itemData.ItemBrandId;
      if (brandId && !cachedBrandMetadata[brandId]) {
        const brandName = lang.value["ST_ItemCategoryName"][`TXT_NAME_${brandId.slice(3)}`] || brandId;
        let imageSrc = "";
        if (itemData.IconTexture) {
          imageSrc = itemData.IconTexture.AssetPathName.split(".")[0] + ".png";
        }
        cachedBrandMetadata[brandId] = {
          id: brandId,
          name: brandName,
          imageSrc,
        };
      }
    }
  });

  if (isError.value) {
    return (
      <>
        <div class="flex items-center">
          <span class="text-red-500">Item not found.</span>
        </div>
        <p>
          Click <Link href="/items">here</Link> to go back to the item list.
        </p>
      </>
    );
  }

  if (!metadata.value || !genericTable.value) {
    return (
      <div class="flex items-center">
        <Spinner color="purple" />
        <span class="ml-2">Loading item data...</span>
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
          <Breadcrumb.Item href="/items">Items</Breadcrumb.Item>
          <Breadcrumb.Item>{metadata.value.name}</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div class="flex flex-row">
        <Image class="rounded-lg" src={metadata.value.imageSrc} width={128} height={128} />
        <div class="flex flex-col justify-center ml-4">
          <h1 class="text-4xl font-bold">{metadata.value.name}</h1>
          <div class="flex flex-row mt-2">
            <Link href={`/items?genre=${metadata.value.genre.id}`} underline={false}>
              <Badge bordered type="green" content={metadata.value.genre.name} />
            </Link>
            <Link href={`/items?category=${metadata.value.category.id}`} underline={false}>
              <Badge bordered type="blue" content={metadata.value.category.name} />
            </Link>
            <Link href={`/items?brand=${metadata.value.brand.id}`} underline={false}>
              <Badge bordered type="pink" content={metadata.value.brand.name} />
            </Link>
          </div>
        </div>
      </div>
      <Hr />
      <div class="mt-4">
        <h2 class="text-2xl font-semibold">Description</h2>
        <p class="text-gray-300">{metadata.value.desc}</p>
      </div>
      <div class="mt-4 lg:grid lg:grid-cols-[repeat(auto-fit,500px)] lg:gap-4">
        <div>
          <h2 class="text-2xl font-semibold">Generic Properties</h2>
          <Table class="mt-2" hoverable>
            <Table.Head>
              <Table.HeadCell>Property</Table.HeadCell>
              <Table.HeadCell>Value</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {Object.entries(genericTable.value).map(([key, value]) => (
                <Table.Row key={key}>
                  <Table.Cell>{key}</Table.Cell>
                  <Table.Cell>{typeof value === "boolean" ? (value ? "Yes" : "No") : value}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
        {equipmentParameter.value && (
          <div>
            <h2 class="text-2xl font-semibold">Equipment Parameter</h2>
            <Table class="mt-2" hoverable>
              <Table.Head>
                <Table.HeadCell>Property</Table.HeadCell>
                <Table.HeadCell>Value</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {Object.entries(equipmentParameter.value).map(([key, value]) => (
                  <Table.Row key={key}>
                    <Table.Cell>{key}</Table.Cell>
                    <Table.Cell>{typeof value === "boolean" ? (value ? "Yes" : "No") : value}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
        {recipeParameter.value && (
          <div>
            <h2 class="text-2xl font-semibold">Recipe</h2>
            <Table class="mt-2" hoverable>
              <Table.Head>
                <Table.HeadCell>Item</Table.HeadCell>
                <Table.HeadCell>Amount</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {recipeParameter.value.map((item) => {
                  return (
                    <Table.Row key={item.id}>
                      <Table.Cell>
                        <Item data={item} />
                      </Table.Cell>
                      <Table.Cell>{item.amount}</Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </div>
        )}
      </div>
      <div class="mt-4">
        <h2 class="text-2xl font-semibold">Recipes using this item</h2>
        <div class="w-fit">
          {recipesUsingThisItem.length > 0 ? (
            <Table class="mt-2" hoverable>
              <Table.Head>
                <Table.HeadCell>Item</Table.HeadCell>
                <Table.HeadCell>Material 1</Table.HeadCell>
                <Table.HeadCell>Material 2</Table.HeadCell>
                <Table.HeadCell>Material 3</Table.HeadCell>
                <Table.HeadCell>Material 4</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {recipesUsingThisItem.map(({ recipe, result }, index) => {
                  return (
                    <Table.Row key={index}>
                      <Table.Cell>
                        <Link href={`/items/${result.id}`} underline={false}>
                          <div class="text-white hover:scale-105 transition-transform ease-out duration-150 flex gap-2 items-center">
                            <Image src={result.imageSrc} width={32} height={32} />
                            {result.name}
                          </div>
                        </Link>
                      </Table.Cell>
                      {recipe.map((item, index) => (
                        <Table.Cell key={index}>
                          <Item data={item} />
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          ) : (
            <p>No recipes found using this item.</p>
          )}
        </div>
      </div>
    </>
  );
});

type ItemProps = {
  data: ItemMetadata | { id: string; name: string };
};
const Item = component$<ItemProps>((props) => {
  const cachedBrandMetadata = useContext(CachedBrandMetadataContext);
  const { data } = props;
  const isItem = "imageSrc" in data;
  let imageSrc = isItem ? data.imageSrc : "";
  if (!imageSrc) {
    const brandMetadata = cachedBrandMetadata[data.id];
    if (brandMetadata) {
      imageSrc = brandMetadata.imageSrc || "";
    }
  }
  const href = isItem ? `/items/${data.id}` : `/items/?brand=${data.id}`;
  return (
    <Link href={href} underline={false}>
      <div class="text-white hover:scale-105 transition-transform ease-out duration-150 flex gap-2 items-center">
        <Image src={imageSrc} width={32} height={32} />
        {isItem ? data.name : <Badge type="pink" bordered content={data.name}></Badge>}
      </div>
    </Link>
  );
});

export const head: DocumentHead = {
  title: "Item Details - Mihoshi Habaki",
  meta: [
    {
      name: "description",
      content: "Details about the Rune Factory: Guardians of Azuma item.",
    },
  ],
};

// TODO: Add gifts
// TODO: Food stats
// TODO: Magatama stats?
// TODO: How to obtain
