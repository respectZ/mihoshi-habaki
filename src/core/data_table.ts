import { DT_Character } from "./data_table/character/character";
import { DT_CharacterProfile } from "./data_table/communication/character_profile";
import { DT_CommunicationCommand } from "./data_table/communication/communication_command";
import { DT_NpcPickyItem } from "./data_table/communication/picky_item";
import { IDataTable } from "./data_table/interface";
import { DT_EqupimentParam } from "./data_table/item/equipment_param";
import { DT_Item } from "./data_table/item/item";
import { DT_RecipeParam } from "./data_table/item/recipe_param";

const tables = {
  character: "/Game/Senbei/DataTable/Character/DT_Character.json",
  characterProfile: "/Game/Senbei/DataTable/Communication/DT_CharacterProfile.json",
  communicationCommand: "/Game/Senbei/DataTable/Communication/DT_CommunicationCommand.json",
  npcPickyItem: "/Game/Senbei/DataTable/Communication/DT_NpcPickyItem.json",
  item: "/Game/Senbei/DataTable/Item/DT_Item.json",
  equipmentParam: "/Game/Senbei/DataTable/Item/DT_EquipmentParam.json",
  recipeParam: "/Game/Senbei/DataTable/Item/DT_RecipeParam.json",
} satisfies Record<TableType, string>;

type TableTypes = {
  character: IDataTable<DT_Character>;
  characterProfile: IDataTable<DT_CharacterProfile>;
  communicationCommand: IDataTable<DT_CommunicationCommand>;
  npcPickyItem: IDataTable<DT_NpcPickyItem>;
  item: IDataTable<DT_Item>;
  equipmentParam: IDataTable<DT_EqupimentParam>;
  recipeParam: IDataTable<DT_RecipeParam>;
};
type TableType = keyof TableTypes;
const tableCache: Partial<Record<TableType, IDataTable<object> | null>> = {};
export async function getDataTable<T extends TableType>(table: T): Promise<TableTypes[T]> {
  if (tableCache[table]) {
    return tableCache[table] as TableTypes[T];
  }

  const response = await fetch(tables[table]);
  const [data] = (await response.json()) as TableTypes[T][];
  tableCache[table] = data;
  return data;
}
