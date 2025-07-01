export type DT_Character = {
  NameTextKey: string;
  AliasNameTextKey: string;
  NicknameAssetId: string;
  TribeType: string;
  Asset: {
    Key: string;
    DataTablePath: {
      AssetPathName: string;
      SubPathString: string;
    };
    DefaultDataTableName: string;
  };
  Ability: {
    Key: string;
    DataTablePath: {
      AssetPathName: string;
      SubPathString: string;
    };
    DefaultDataTableName: string;
  };
  Param: {
    Key: string;
    DataTablePath: {
      AssetPathName: string;
      SubPathString: string;
    };
    DefaultDataTableName: string;
  };
  Growth: {
    Key: string;
    DataTablePath: {
      AssetPathName: string;
      SubPathString: string;
    };
    DefaultDataTableName: string;
  };
  FamilyChild: {
    Key: string;
    DataTablePath: {
      AssetPathName: string;
      SubPathString: string;
    };
    DefaultDataTableName: string;
  };
  NeedAttachmentObject: {
    Key: string;
    DataTablePath: {
      AssetPathName: string;
      SubPathString: string;
    };
    DefaultDataTableName: string;
  };
  LookAtCharacterUniqueParam: {
    Key: string;
    DataTablePath: {
      AssetPathName: string;
      SubPathString: string;
    };
    DefaultDataTableName: string;
  };
  VillagerAIDataAsset: {
    Key: string;
    DataTablePath: {
      AssetPathName: string;
      SubPathString: string;
    };
    DefaultDataTableName: string;
  };
  PartnerAIDataAsset: {
    Key: string;
    DataTablePath: {
      AssetPathName: string;
      SubPathString: string;
    };
    DefaultDataTableName: string;
  };
  StatusAilmentEffectSet: {
    Key: string;
    DataTablePath: {
      AssetPathName: string;
      SubPathString: string;
    };
    DefaultDataTableName: string;
  };
  StatusBarrierEffectSet: {
    Key: string;
    DataTablePath: {
      AssetPathName: string;
      SubPathString: string;
    };
    DefaultDataTableName: string;
  };
  SpawnBulletSet: {
    Key: string;
    DataTablePath: {
      AssetPathName: string;
      SubPathString: string;
    };
    DefaultDataTableName: string;
  };
  VillagerParam: {
    Key: string;
    DataTablePath: {
      AssetPathName: string;
      SubPathString: string;
    };
    DefaultDataTableName: string;
  };
  SpeedParam: {
    WalkSpeed: number;
    TrotSpeed: number;
    RunSpeed: number;
    DashSpeed: number;
    SuperDashSpeed: number;
    AimingMoveSpeed: number;
    ChargingMoveSpeed: number;
  };
  JumpZVelocity: number;
  ActorScale: number;
  bCanRide: boolean;
  KnockbackScale: number;
  bUseCompletelyVanishDistance: boolean;
  WalkType: string;
  ContextResources: {
    AttachmentObject: {
      AssetPathName: string;
      SubPathString: string;
    };
  };
  SortOrder: number;
};
