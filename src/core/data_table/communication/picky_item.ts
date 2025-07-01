export type DT_NpcPickyItem = {
  TargetCharacterID: string;
  LoveChapterRange: {
    Min: number;
    Max: number;
  };
  Purpose: string; // EAppCommunicationPickyPurpose
  PickyType: string; // EAppCommunicationPickyType
  ItemIdArray: string[];
  QuestFlagID: string;
  QuestFlagVal: number;
};
