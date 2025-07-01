import { LangContextType } from "~/context/lang";

class ResidenceManager {
  readonly residences = ["spring", "summer", "autumn", "winter", "unknown"] as const;
  readonly table: Record<Residence, Readonly<string[]>> = {
    spring: [
      "ID_LNPC000", // Subaru
      "ID_LNPC001", // Kaguya
      "ID_LNPC002", // Murasame
      "ID_LNPC003", // Mauro
      "ID_LNPC008", // Ulalaka
      "ID_LNPC009", // Iroha
      "ID_LNPC013", // Hina
      "ID_WNPC017", // Sakaki
      "ID_WNPC018", // Takumi
      "ID_WNPC019", // Suzu
    ],
    summer: [
      "ID_LNPC010", // Matsuri
      "ID_WNPC020", // Tsubame
      "ID_WNPC021", // Hisui
      "ID_WNPC022", // Kosatsu
    ],
    autumn: [
      "ID_LNPC004", // Kai
      "ID_LNPC005", // Kurama
      "ID_LNPC015", // Cuilang
      "ID_WNPC023", // Kotaro
      "ID_WNPC024", // Yachiyo
    ],
    winter: [
      "ID_LNPC006", // Fubuki
      "ID_LNPC016", // Pilika
      "ID_WNPC025", // Zaza
      "ID_WNPC026", // Watarase
    ],
    unknown: [
      "ID_LNPC007", // Ikaruga
      "ID_LNPC011", // Kanata
      "ID_LNPC014", // Clarice
    ],
  };
  getVillagerResidence(id: string): Residence {
    for (const residence of this.residences) {
      if (this.table[residence].includes(id)) {
        return residence;
      }
    }
    return "unknown"; // Default to unknown if not found
  }
  getData(residence: Residence, lang: LangContextType) {
    const index = this.residences.indexOf(residence);
    let imageSrc = `/Game/Senbei/UI/Textures/T_UI_menu_village_tabicon_${index.toString().padStart(2, "0")}.png`;
    const text =
      lang.value?.["ST_Common"][`TXT_CMN_Village${(index + 1).toString().padStart(3, "0")}`] ||
      lang.value?.["ST_Common"]["TXT_CMN_Unopened"] ||
      "";
    if (index >= 4) {
      imageSrc = ""; // No image for unknown residences
    }
    return {
      id: residence,
      index,
      imageSrc,
      text,
    };
  }
}

export const residenceManager = new ResidenceManager();
export type Residence = (typeof residenceManager.residences)[number];
export type ResidenceData = ReturnType<ResidenceManager["getData"]>;
