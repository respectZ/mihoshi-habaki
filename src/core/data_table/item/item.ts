export type DT_Item = {
  ItemName: string;
  ItemNameTextKey: string;
  ItemNameMultiTextKey: string;
  ItemNameGrammar01TextKey: string;
  ItemNameGrammar02TextKey: string;
  ItemExplanationTextKey: string;
  ItemGenreId: string;
  ItemCategoryId: string;
  ItemBrandId: string;
  BaseSellingPrice: number;
  BaseBuyingPrice: number;
  bSaleAllowed: boolean;
  bGiftAllowed: boolean;
  CombatSkillId: string;
  EatingSkillId: string;
  EnhanceSkillId: string;
  TrainingSkillId: string;
  StackLimit: number;
  DropMeshId: string;
  IconTexture: {
    AssetPathName: string;
    SubPathString: string;
  };
  OrderIndex: number;
};
