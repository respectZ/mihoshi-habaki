export type DA_CommunicationNpc = {
  Properties: {
    CommandPreference: {
      Key: string;
      Value: string;
    }[];
  };
};

/**
 *
 * @param id The ID of the character to get communication data for.
 * @returns
 * @example
 * ```ts
 * const communicationData = await getCharacterCommunication("LNPC000");
 * ```
 */
export async function getCharacterCommunication(id: string): Promise<DA_CommunicationNpc> {
  const [json] = (await (
    await fetch(`/Game/Senbei/Communication/Communication_NPC/DA_CommunicationNpc_${id}.json`)
  ).json()) as DA_CommunicationNpc[];
  return json;
}
