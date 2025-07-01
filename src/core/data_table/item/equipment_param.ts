export type DT_EqupimentParam = {
  EquipmentParamName: string;
  AttackType: string; // EAppAttackType
  HitEffect: string; // EAppHitEffectAttackType
  PhysicalAttackPower: {
    InitValue: number;
    GrowthValue: number;
  };
  PhysicalDefensePower: {
    InitValue: number;
    GrowthValue: number;
  };
  MagicAttackPower: {
    InitValue: number;
    GrowthValue: number;
  };
  MagicDefensePower: {
    InitValue: number;
    GrowthValue: number;
  };
  CriticalRate: {
    InitValue: number;
    GrowthValue: number;
  };
  AttackElementType: string; // EAppElementType
  ElementDamage: string; // EAppElementDamageType
  "ElementDamage[1]": string; // EAppElementDamageType
  "ElementDamage[2]": string; // EAppElementDamageType
  "ElementDamage[3]": string; // EAppElementDamageType
  "ElementDamage[4]": string; // EAppElementDamageType
  "ElementDamage[5]": string; // EAppElementDamageType
  "ElementDamage[6]": string; // EAppElementDamageType
  "ElementDamage[7]": string; // EAppElementDamageType
  Slot: number;
  PostureEnduranceValue: number;
  PostureEnduranceImpactValue: number;
  BreakEnduranceImpactValue: number;
  GuardEnduranceImpactValue: number;
  ArmorPenetrationRate: number;
  MagicPenetrationRate: number;
  StationaryStoneParamId: string;
};
