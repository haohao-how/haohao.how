import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";

export const asyncJson = (() => {
  let dataPromise:
    | undefined
    | Promise<Record<string, { mnemonic: string; rationale: string }[]>>;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const asset = Asset.fromModule(require(`./radicalNameMnemonics.jsonasset`));

  return {
    lookupNameMnemonic: async (hanzi: string) => {
      if (dataPromise === undefined) {
        type RawData = [
          hanzi: string,
          mnemonics: {
            mnemonic: string;
            rationale: string;
          }[],
        ][];

        dataPromise = (
          asset.localUri !== null
            ? FileSystem.readAsStringAsync(asset.localUri).then(
                (x) => JSON.parse(x) as RawData,
              )
            : fetch(asset.uri).then(
                (response) => response.json() as unknown as RawData,
              )
        ).then((x) => Object.fromEntries(x));
      }
      const data = await dataPromise;
      return data[hanzi]?.[0];
    },
  };
})();
