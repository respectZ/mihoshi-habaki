import { LangContextType } from "~/context/lang";
import { IDataTable } from "./data_table/interface";
import { DT_EqupimentParam } from "./data_table/item/equipment_param";
import { DT_Item } from "./data_table/item/item";
import { DT_RecipeParam } from "./data_table/item/recipe_param";

export type DataTableItemSignal = {
  loaded: boolean;
  DT_Item: IDataTable<DT_Item> | undefined;
};

export type EquipmentParamTable = {
  DT_Item: IDataTable<DT_Item>;
  DT_EquipmentParam: IDataTable<DT_EqupimentParam>;
};

export type RecipeParamTable = {
  DT_Item: IDataTable<DT_Item>;
  DT_RecipeParam: IDataTable<DT_RecipeParam>;
};

class ItemManager {
  getItemMetadata(id: string, dataTable: IDataTable<DT_Item>, lang: LangContextType) {
    const data = dataTable.Rows[id];
    const name = lang.value?.["ST_ItemName"][`TXT_NAME_${id.slice(3)}`] || id;
    const desc = lang.value?.["ST_ItemExplanation"][data.ItemExplanationTextKey] || "";
    const categoryId = data?.ItemCategoryId;
    const category = lang.value?.["ST_ItemCategoryName"][`TXT_NAME_${categoryId.slice(3)}`] || categoryId;
    const genreId = data?.ItemGenreId;
    const genre = lang.value?.["ST_ItemCategoryName"][`TXT_NAME_${genreId.slice(3)}`] || genreId;
    const brandId = data?.ItemBrandId;
    const brand = lang.value?.["ST_ItemCategoryName"][`TXT_NAME_${brandId.slice(3)}`] || brandId;
    const imageSrc = data?.IconTexture.AssetPathName.split(".")[0] + ".png" || "";
    const baseSellingPrice = data?.BaseSellingPrice || 0;
    const baseBuyingPrice = data?.BaseBuyingPrice || 0;
    const saleAllowed = data?.bSaleAllowed || false;
    const buyAllowed = data?.bGiftAllowed || false;
    return {
      id,
      name,
      desc,
      imageSrc,
      category: {
        name: category,
        id: categoryId,
      },
      genre: {
        name: genre,
        id: genreId,
      },
      brand: {
        name: brand,
        id: brandId,
      },
      baseSellingPrice,
      baseBuyingPrice,
      saleAllowed,
      buyAllowed,
    };
  }
  getEquipmentParameter(id: string, tables: EquipmentParamTable, lang: LangContextType) {
    const key = "ID_PRM_" + id.slice(7); // ID_ITM_WEP_ONE010 => ID_PRM_WEP_ONE010
    const itemData = tables.DT_Item.Rows[id];
    const itemParamData = tables.DT_EquipmentParam.Rows[key];
    if (!itemData || !itemParamData || !lang.value) {
      return;
    }
    const attackType = itemParamData.AttackType;
    const physicalAttackPower = itemParamData.PhysicalAttackPower.InitValue;
    const physicalDefensePower = itemParamData.PhysicalDefensePower.InitValue;
    const magicAttackPower = itemParamData.MagicAttackPower.InitValue;
    const magicDefensePower = itemParamData.MagicDefensePower.InitValue;
    const criticalRate = itemParamData.CriticalRate.InitValue;
    const attackElementType = itemParamData.AttackElementType;
    return {
      id,
      attackType,
      physicalAttackPower,
      physicalDefensePower,
      magicAttackPower,
      magicDefensePower,
      criticalRate,
      attackElementType,
    };
  }
  getRecipeParameter(id: string, tables: RecipeParamTable, lang: LangContextType): RecipeParameter | undefined {
    const key = "ID_PRM_RCP_" + id.slice(7); // ID_ITM_WEP_ONE010 => ID_RCP_WEP_ONE010
    const itemData = tables.DT_Item.Rows[id];
    const recipeParamData = tables.DT_RecipeParam.Rows[key];
    if (!itemData || !recipeParamData || !lang.value) {
      return;
    }
    // Verify recipe
    const hasRecipe = recipeParamData.MaterialParams.some((param) => param.ItemId != "None");
    if (!hasRecipe) {
      return;
    }
    const recipe: RecipeParameter = [];
    for (const param of recipeParamData.MaterialParams) {
      const itemId = param.ItemId;
      if (itemId === "None") {
        continue; // Skip if the item ID is "None"
      }
      // Item check
      if (itemId.startsWith("ID_ITM")) {
        const itemMetadata = this.getItemMetadata(itemId, tables.DT_Item, lang);
        if (itemMetadata) {
          recipe.push({
            ...itemMetadata,
            amount: param.RequiredQuantity,
          });
        }
      } else {
        // ID_BRN_LVP_MLK
        // This is a category, not an item
        const name = lang.value["ST_ItemCategoryName"][`TXT_NAME_${itemId.slice(3)}`] || itemId;
        recipe.push({
          amount: param.RequiredQuantity,
          id: itemId,
          name,
        });
      }
    }
    return recipe;
  }
  findRecipesUsingItem(id: string, tables: RecipeParamTable, lang: LangContextType): RecipeUsingThisItemResult {
    const recipes: RecipeUsingThisItemResult = [];
    for (const recipeId in tables.DT_RecipeParam.Rows) {
      const itemResultId = "ID_ITM_" + recipeId.slice(11);
      const recipe = tables.DT_RecipeParam.Rows[recipeId];
      if (recipe.MaterialParams.some((param) => param.ItemId === id)) {
        const recipe = this.getRecipeParameter(itemResultId, tables, lang);
        if (recipe) {
          // Hacky way
          // ID_PRM_RCP_FOD_MRE007 => ID_ITM_FOD_MRE007
          const result = this.getItemMetadata(itemResultId, tables.DT_Item, lang);
          if (result) {
            recipes.push({ result, recipe });
          }
        }
      }
    }
    return recipes;
  }
}

export const itemManager = new ItemManager();
export type ItemMetadata = ReturnType<ItemManager["getItemMetadata"]>;
export type EquipmentParameter = ReturnType<ItemManager["getEquipmentParameter"]>;
export type RecipeParameter = Array<
  (ItemMetadata | BrandMetadata) & {
    amount: number;
  }
>;
export type BrandMetadata = {
  id: string;
  name: string;
};
export type RecipeUsingThisItemResult = Array<{
  result: ItemMetadata;
  recipe: RecipeParameter;
}>;
