import {
  component$,
  createContextId,
  useComputed$,
  useContext,
  useContextProvider,
  useStore,
  useTask$,
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
import { BrandMetadata, EquipmentParameter, ItemMetadata, RecipeParameter, itemManager } from "~/core/item_manager";

type GenericTable = {
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

type DataResult = {
  metadata: ItemMetadata;
  genericTable: GenericTable;
  equipmentParameter?: EquipmentParameter;
  recipeParameter?: RecipeParameter;
};

const CachedBrandMetadataContext = createContextId<Record<string, CachedBrandMetadata>>("CachedBrandMetadataContext");

export default component$(() => {
  const loc = useLocation();
  const head = useDocumentHead();
  const lang = useContext(LangContext);
  const itemId = loc.params.id;
  const dataTable = useStore<DataTable>(
    {
      loaded: false,
    },
    { deep: false },
  );
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
  // Cache brand metadata for quick access
  useVisibleTask$(({ track }) => {
    const DT_Item = dataTable.DT_Item;
    track(() => [dataTable.DT_Item, lang.value]);
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
  // Compute item data
  const data = useComputed$(() => {
    const DT_Item = dataTable.DT_Item;
    const DT_EquipmentParam = dataTable.DT_EquipmentParam;
    const DT_RecipeParam = dataTable.DT_RecipeParam;
    if (!DT_Item || !lang.value) {
      return -1;
    }
    if (!DT_Item.Rows[itemId]) {
      return 0; // Item not found
    }
    const itemData = itemManager.getItemMetadata(itemId, DT_Item, lang);
    const result: DataResult = {
      metadata: itemData,
      genericTable: {
        id: itemData.id,
        name: itemData.name,
        category: itemData.category.name,
        genre: itemData.genre.name,
        sellable: itemData.saleAllowed,
        baseSellingPrice: itemData.baseSellingPrice,
        buyable: itemData.buyAllowed,
        baseBuyingPrice: itemData.baseBuyingPrice,
      },
    };
    // Fetch equipment parameter if available
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
        result.equipmentParameter = equipmentParam;
      }
    }
    // Fetch recipe parameter if available
    if (DT_RecipeParam) {
      const recipeParam = itemManager.getRecipeParameter(
        itemId,
        {
          DT_Item,
          DT_RecipeParam,
        },
        lang,
      );
      if (recipeParam) {
        result.recipeParameter = recipeParam;
      }
    }
    return result;
  });
  // Find recipes using this item
  const recipesUsingThisItem = useComputed$(() => {
    const DT_Item = dataTable.DT_Item;
    const DT_RecipeParam = dataTable.DT_RecipeParam;
    if (!DT_Item || !DT_RecipeParam || !lang.value) {
      return [];
    }
    // Verify the item ID is valid
    if (!DT_Item.Rows[itemId]) {
      return [];
    }
    const dt = {
      DT_Item,
      DT_RecipeParam,
    };
    // TODO: Optimize this by changing first parameter into ItemMetadata
    const resultByItem = itemManager.findRecipesUsingItem(itemId, dt, lang);
    const brandId = DT_Item.Rows[itemId].ItemBrandId;
    if (brandId) {
      const resultByBrand = itemManager.findRecipesUsingItem(brandId, dt, lang);
      return [...resultByBrand, ...resultByItem];
    }
    return resultByItem;
  });
  // Update the document title when data changes
  useTask$(({ track }) => {
    track(() => data.value);
    if (typeof data.value === "object") {
      // @ts-expect-error: read-only property. Hack way to dynamically set the title
      head.title = `${data.value.metadata.name} - Mihoshi Habaki`;
    }
  });

  if (data.value === -1) {
    return (
      <div class="flex items-center">
        <Spinner color="purple" />
        <span class="ml-2">Loading item data...</span>
      </div>
    );
  }

  if (data.value === 0) {
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

  const metadata = data.value.metadata;
  const genericTable = data.value.genericTable;
  const equipmentParameter = data.value.equipmentParameter;
  const recipeParameter = data.value.recipeParameter;

  return (
    <>
      <div class="mb-4">
        <Breadcrumb>
          <Breadcrumb.Item home href="/">
            Home
          </Breadcrumb.Item>
          <Breadcrumb.Item href="/items">Items</Breadcrumb.Item>
          <Breadcrumb.Item>{metadata.name}</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div class="flex flex-row">
        <Image class="rounded-lg" src={metadata.imageSrc} width={128} height={128} />
        <div class="flex flex-col justify-center ml-4">
          <h1 class="text-4xl font-bold">{metadata.name}</h1>
          <div class="flex flex-row mt-2">
            <Link href={`/items?genre=${metadata.genre.id}`} underline={false}>
              <Badge bordered type="green" content={metadata.genre.name} />
            </Link>
            <Link href={`/items?category=${metadata.category.id}`} underline={false}>
              <Badge bordered type="blue" content={metadata.category.name} />
            </Link>
            <Link href={`/items?brand=${metadata.brand.id}`} underline={false}>
              <Badge bordered type="pink" content={metadata.brand.name} />
            </Link>
          </div>
        </div>
      </div>
      <Hr />
      <div class="mt-4">
        <h2 class="text-2xl font-semibold">Description</h2>
        <p class="text-gray-300">{metadata.desc}</p>
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
              {Object.entries(genericTable).map(([key, value]) => (
                <Table.Row key={key}>
                  <Table.Cell>{key}</Table.Cell>
                  <Table.Cell>{typeof value === "boolean" ? (value ? "Yes" : "No") : value}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
        {equipmentParameter && (
          <div>
            <h2 class="text-2xl font-semibold">Equipment Parameter</h2>
            <Table class="mt-2" hoverable>
              <Table.Head>
                <Table.HeadCell>Property</Table.HeadCell>
                <Table.HeadCell>Value</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {Object.entries(equipmentParameter).map(([key, value]) => (
                  <Table.Row key={key}>
                    <Table.Cell>{key}</Table.Cell>
                    <Table.Cell>{typeof value === "boolean" ? (value ? "Yes" : "No") : value}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
        {recipeParameter && (
          <div>
            <h2 class="text-2xl font-semibold">Recipe</h2>
            <Table class="mt-2" hoverable>
              <Table.Head>
                <Table.HeadCell>Item</Table.HeadCell>
                <Table.HeadCell>Amount</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {recipeParameter.map((item) => {
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
          {recipesUsingThisItem.value.length > 0 ? (
            <Table class="mt-2" hoverable>
              <Table.Head>
                <Table.HeadCell>Item</Table.HeadCell>
                <Table.HeadCell>Material 1</Table.HeadCell>
                <Table.HeadCell>Material 2</Table.HeadCell>
                <Table.HeadCell>Material 3</Table.HeadCell>
                <Table.HeadCell>Material 4</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {recipesUsingThisItem.value.map(({ recipe, result }, index) => {
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
