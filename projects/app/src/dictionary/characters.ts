import { invariant } from "@haohaohow/lib/invariant";

interface CharacterDatum {
  char: string;
  mnemonic?: string;
  names: string | string[];
  pronunciations?: string[];
  radicals?: string[];
}

export interface Character {
  char: string;
  mnemonic?: string;
  name: string;
  nameAlts?: string[];
  pronunciations?: string[];
  radicals?: string[];
}

const characterData: CharacterDatum[] = [];

// Transform data into an easier shape to work with.
const characters = characterData.map(
  ({ char, names, pronunciations, mnemonic, radicals }) => {
    const [name, ...altNames] = names;
    invariant(name !== undefined, `expected at least one name`);

    const character: Character = {
      char,
      name,
    };

    if (altNames.length > 0) {
      character.nameAlts = altNames;
    }

    if (pronunciations !== undefined && pronunciations.length > 0) {
      character.pronunciations = pronunciations;
    }

    if (mnemonic !== undefined) {
      character.mnemonic = mnemonic;
    }

    if (radicals !== undefined && radicals.length > 0) {
      character.radicals = radicals;
    }

    return character;
  },
);

/**
 * Lookup by character.
 */
export const characterLookupByHanzi: ReadonlyMap<string, Character> = new Map(
  characters.map((c) => [c.char, c]),
);
