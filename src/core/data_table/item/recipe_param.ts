export type DT_RecipeParam = {
  RecipeParamName: string;
  ItemId: string;
  Fee: number;
  MaterialParams: Array<{
    ItemId: string;
    MinLevel: number;
    RequiredQuantity: number;
  }>;
  CraftableCharacterId: string;
  ArrangedRecipeItemIdList: Array<string>;
  CraftSoundId: string;
  CraftItemLevelCalcMethod: string;
};
