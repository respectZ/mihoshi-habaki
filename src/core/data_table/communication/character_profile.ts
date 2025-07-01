export type DT_CharacterProfile = {
  CharacterId: string;
  bUpgradeFlag: number;
  ValidateProgress: number;
  PartnerType: string;
  NameStringTableKeyData: {
    Key: string;
    StringTablePath: {
      AssetPathName: string;
      SubPathString: string;
    };
    DefaultStringTableName: string;
    StringTableId: string;
  };
  bUseSavedBirthday: boolean;
  BirthdayMonth: number;
  BirthdayDay: number;
  BirthdayCalendarId: string;
  BirthDayKeyData: {
    Key: string;
    StringTablePath: {
      AssetPathName: string;
      SubPathString: string;
    };
    DefaultStringTableName: string;
    StringTableId: string;
  };
  MainSentenceKeyData: {
    Key: string;
    StringTablePath: {
      AssetPathName: string;
      SubPathString: string;
    };
    DefaultStringTableName: string;
    StringTableId: string;
  };
  ProfileElemArray: {
    ElemType: string;
    StringTableKeyData: {
      Key: string;
      StringTablePath: {
        AssetPathName: string;
        SubPathString: string;
      };
      DefaultStringTableName: string;
      StringTableId: string;
    };
  }[];
  CloudImageMaterial: {
    AssetPathName: string;
    SubPathString: string;
  };
  CloudShadowImageMaterial: {
    AssetPathName: string;
    SubPathString: string;
  };
};
