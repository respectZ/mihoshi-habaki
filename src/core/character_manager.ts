import { LangContextType } from "~/context/lang";
import { DA_CommunicationNpc } from "~/core/data_table/character_communication";
import { DT_CommunicationCommand } from "~/core/data_table/communication/communication_command";
import { DT_NpcPickyItem } from "~/core/data_table/communication/picky_item";
import { IDataTable } from "~/core/data_table/interface";
import { DT_Item } from "~/core/data_table/item/item";
import { CommunicationPickyType } from "~/core/enum/comunication_picky_type";
import { ProfileElemType } from "~/core/enum/profile_elem_type";
import { ResidenceData, residenceManager } from "~/core/residence_manager";
import { DT_Character } from "./data_table/character/character";
import { DT_CharacterProfile } from "./data_table/communication/character_profile";

export type DataTableSignal = {
  loaded: boolean;
  DT_Character: IDataTable<DT_Character> | undefined;
  DT_Profile: IDataTable<DT_CharacterProfile> | undefined;
  // Reactive, lazy-loaded tables
  // Preferences
  DT_NpcPickyItem: IDataTable<DT_NpcPickyItem> | undefined;
  DT_Item: IDataTable<DT_Item> | undefined;
  // Communication
  DT_CommunicationCommand: IDataTable<DT_CommunicationCommand> | undefined;
  DA_CommunicationNpc: DA_CommunicationNpc | undefined;
};
export type CharacterData = {
  id: string;
  /**
   * Character name, localized.
   */
  name: string;
  /**
   * Character image source URL.
   */
  imageSrc: string;
  /**
   * Character alias, localized.
   */
  alias: string;
  /**
   * Whether the character is a marriage candidate.
   */
  isMarriageCandidate: boolean;
  /**
   * Residence data for the character.
   */
  residence: ResidenceData;
  /**
   * Character profile data, localized.
   */
  profile: [string, string][];
  /**
   * Character description, localized.
   */
  desc: string;
  /**
   * Picky items for communication, categorized by type.
   */
  pickyItem: Record<CommunicationPickyType, string[]>;
};

class CharacterManager {
  getData(id: string, data: DataTableSignal, lang: LangContextType): CharacterData {
    const character = data.DT_Character?.Rows[id];
    const profile = data.DT_Profile?.Rows[id];
    if (!character || !profile) {
      throw new Error(`Character with ID ${id} not found`);
    }
    const key = id.slice(3); // ID_LNPC001 -> "LNPC001"
    const imageSrc = `/Game/Senbei/UI/Textures/Face/T_UI_menu_friend_face_${key}.png`;
    const name = lang.value?.["ST_CharacterName"][character.NameTextKey] || character.NameTextKey;
    const alias = lang.value?.["ST_Character_AliasName"][character.AliasNameTextKey] || character.AliasNameTextKey;
    const isMarriageCandidate = id.includes("LNPC");
    const villagerResidence = residenceManager.getVillagerResidence(id);
    const residence = residenceManager.getData(villagerResidence, lang);
    const profileData = profile.ProfileElemArray.reduce(
      (acc, elem) => {
        const enumKey = elem.ElemType.split("::")[1] as keyof typeof ProfileElemType;
        acc.push([
          lang.value?.["ST_Menu"][`TXT_PD_CAT_T${ProfileElemType[enumKey]}`] || elem.ElemType,
          lang.value?.["ST_Menu"][elem.StringTableKeyData.Key] || elem.StringTableKeyData.Key,
        ]);
        return acc;
      },
      [] as [string, string][],
    );
    let desc = lang.value?.["ST_Menu"][`TXT_CP_${key}`];
    if (!desc) {
      // _0 + _1
      desc =
        (lang.value?.["ST_Menu"]?.[`TXT_CP_${key}` + "_0"] || "") +
        " " +
        (lang.value?.["ST_Menu"]?.[`TXT_CP_${key}` + "_1"] || "");
    }
    return {
      id,
      name,
      imageSrc,
      alias,
      isMarriageCandidate,
      residence,
      profile: profileData,
      desc: desc || "",
      pickyItem: {} as Record<CommunicationPickyType, string[]>,
    };
  }
  // TODO: Add getPickyItems and move characters/tabs.tsx logic to use this.
}

export const characterManager = new CharacterManager();
