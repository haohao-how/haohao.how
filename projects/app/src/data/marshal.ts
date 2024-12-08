import { iterTake, mapInvert, objectInvert } from "@/util/collections";
import { Rating } from "@/util/fsrs";
import { invariant } from "@haohaohow/lib/invariant";
import mapKeys from "lodash/mapKeys";
import mapValues from "lodash/mapValues";
import omit from "lodash/omit";
import pick from "lodash/pick";
import {
  IndexDefinitions,
  ReadonlyJSONValue,
  ReadTransaction,
  WriteTransaction,
} from "replicache";
import z from "zod";
import {
  Skill,
  SkillReview as SkillReviewValue,
  SkillState as SkillStateValue,
  SkillType,
  SrsState,
  SrsType,
} from "./model";

export type OpaqueJSON = ReadonlyJSONValue;

//
// SrsType
//
const SrsTypeMarshal = {
  [SrsType.Null]: `0`,
  [SrsType.FsrsFourPointFive]: `1`,
} as const;
const SrsTypeUnmarshal = {
  [`0`]: SrsType.Null,
  [`1`]: SrsType.FsrsFourPointFive,
} as const;

//
// SrsState
//
const MarshaledSrsState = z
  .discriminatedUnion(`t`, [
    z.object({
      /** type */
      t: z.literal(SrsTypeMarshal[SrsType.Null]),
    }),
    z.object({
      /** type */
      t: z.literal(SrsTypeMarshal[SrsType.FsrsFourPointFive]),
      /** stability */
      s: z.number(),
      /** difficulty */
      d: z.number(),
    }),
  ])
  .nullable();
type MarshaledSrsState = z.infer<typeof MarshaledSrsState>;

const marshalSrsState = (x: SrsState | null): MarshaledSrsState => {
  switch (x?.type) {
    case undefined:
      return null;
    case SrsType.Null:
      return {
        t: SrsTypeMarshal[x.type],
      };
    case SrsType.FsrsFourPointFive:
      return {
        t: SrsTypeMarshal[x.type],
        s: x.stability,
        d: x.difficulty,
      };
  }
};

const unmarshalSrsState = (x: MarshaledSrsState): SrsState | null => {
  switch (x?.t) {
    case undefined:
      return null;
    case SrsTypeMarshal[SrsType.Null]:
      return {
        type: SrsTypeUnmarshal[x.t],
      };
    case SrsTypeMarshal[SrsType.FsrsFourPointFive]:
      return {
        type: SrsTypeUnmarshal[x.t],
        stability: x.s,
        difficulty: x.d,
      };
  }
};

//
// SkillType
//
const SkillTypeMarshal = {
  [SkillType.RadicalToEnglish]: `re`,
  [SkillType.EnglishToRadical]: `er`,
  [SkillType.RadicalToPinyin]: `rp`,
  [SkillType.PinyinToRadical]: `pr`,
  [SkillType.HanziWordToEnglish]: `he`,
  [SkillType.HanziWordToPinyinInitial]: `hpi`,
  [SkillType.HanziWordToPinyinFinal]: `hpf`,
  [SkillType.HanziWordToPinyinTone]: `hpt`,
  [SkillType.EnglishToHanzi]: `eh`,
  [SkillType.PinyinToHanzi]: `ph`,
  [SkillType.ImageToHanzi]: `ih`,
} as const;
const SkillTypeUnmarshal = {
  [SkillTypeMarshal[SkillType.RadicalToEnglish]]: SkillType.RadicalToEnglish,
  [SkillTypeMarshal[SkillType.EnglishToRadical]]: SkillType.EnglishToRadical,
  [SkillTypeMarshal[SkillType.RadicalToPinyin]]: SkillType.RadicalToPinyin,
  [SkillTypeMarshal[SkillType.PinyinToRadical]]: SkillType.PinyinToRadical,
  [SkillTypeMarshal[SkillType.HanziWordToEnglish]]:
    SkillType.HanziWordToEnglish,
  [SkillTypeMarshal[SkillType.HanziWordToPinyinInitial]]:
    SkillType.HanziWordToPinyinInitial,
  [SkillTypeMarshal[SkillType.HanziWordToPinyinFinal]]:
    SkillType.HanziWordToPinyinFinal,
  [SkillTypeMarshal[SkillType.HanziWordToPinyinTone]]:
    SkillType.HanziWordToPinyinTone,
  [SkillTypeMarshal[SkillType.EnglishToHanzi]]: SkillType.EnglishToHanzi,
  [SkillTypeMarshal[SkillType.PinyinToHanzi]]: SkillType.PinyinToHanzi,
  [SkillTypeMarshal[SkillType.ImageToHanzi]]: SkillType.ImageToHanzi,
} as const;

const MarshaledSkillType = z.enum(
  Object.keys(SkillTypeUnmarshal) as [keyof typeof SkillTypeUnmarshal],
);

//
// Skill
//
const MarshaledSkillStateValue = z.object({
  /** created */
  c: z.string().datetime(),
  /** srs */
  s: MarshaledSrsState,
  /** difficulty */
  d: z.string().datetime(),
});
export type MarshaledSkillStateValue = z.infer<typeof MarshaledSkillStateValue>;

export type MarshaledSkillStateValueJsonPath =
  `/${keyof MarshaledSkillStateValue}`;

export const marshalSkillStateValue = (
  x: SkillStateValue,
): MarshaledSkillStateValue => ({
  c: x.created.toISOString(),
  s: marshalSrsState(x.srs),
  d: x.due.toISOString(),
});

export const unmarshalSkillStateValue = (
  v: MarshaledSkillStateValue,
): SkillStateValue => ({
  created: z.coerce.date().parse(v.c),
  srs: unmarshalSrsState(v.s),
  due: z.coerce.date().parse(v.d),
});

//
// Skill Review
//
const MarshaledSkillReviewValue = z.object({
  /** rating */
  r: z.nativeEnum(Rating),
});
export type MarshaledSkillReviewValue = z.infer<
  typeof MarshaledSkillReviewValue
>;

export const marshalSkillReviewValue = (
  x: SkillReviewValue,
): MarshaledSkillReviewValue => ({
  r: x.rating,
});

export const unmarshalSkillReviewValue = (
  v: MarshaledSkillReviewValue,
): SkillReviewValue => ({
  rating: v.r,
});

//
// Public API, these don't expose the compressed shape in their types so the
// implementation shouldn't leak into the rest of the code.
//

// Skill State
export const unmarshalSkillStateJson = ([key, value]: readonly [
  key: string,
  value: OpaqueJSON,
]): [Skill, SkillStateValue] => [
  unmarshalSkillStateKey(key),
  MarshaledSkillStateValue.transform(unmarshalSkillStateValue).parse(value),
];
export const marshalSkillStateJson = ([skill, state]: readonly [
  Skill,
  SkillStateValue,
]) =>
  [
    marshalSkillStateKey(skill),
    marshalSkillStateValue(state) as OpaqueJSON,
  ] as const;

//
// Skill Review (`sr/${skillId}/${nowTimestamp}`)
//
export type SkillReviewKey = [Skill, Date];
export const unmarshalSkillReviewJson = ([key, value]: readonly [
  key: string,
  value: OpaqueJSON,
]): [SkillReviewKey, SkillReviewValue] => [
  unmarshalSkillReviewKey(key),
  MarshaledSkillReviewValue.transform(unmarshalSkillReviewValue).parse(value),
];
export const marshalSkillReviewJson = ([[skillId, timestamp], state]: readonly [
  SkillReviewKey,
  SkillReviewValue,
]) =>
  [
    marshalSkillReviewKey(skillId, timestamp),
    marshalSkillReviewValue(state) as OpaqueJSON,
  ] as const;
export const skillReviewPrefix = `sr/`;
export const marshalSkillReviewKey = (
  skill: Skill | MarshaledSkillId,
  date: Date | Timestamp,
): MarshaledSkillReviewKey => {
  return `${skillReviewPrefix}${marshalSkillId(skill)}/${typeof date === `number` ? date : date.getTime()}` as MarshaledSkillReviewKey;
};
export const unmarshalSkillReviewKey = (x: string): [Skill, Date] => {
  const result = /^sr\/(.+)\/(.+)$/.exec(x);
  invariant(result !== null);
  const [, skillId, timestamp] = result;
  invariant(skillId !== undefined);
  invariant(timestamp !== undefined);
  return [
    unmarshalSkillId(skillId),
    new Date(z.coerce.number().parse(timestamp)),
  ];
};

//
// SrsState
//
export const unmarshalSrsStateJson = (value: OpaqueJSON): SrsState | null =>
  MarshaledSrsState.transform(unmarshalSrsState).parse(value);
export const marshalSrsStateJson = (x: SrsState | null) =>
  marshalSrsState(x) as OpaqueJSON;

// Skill ID e.g. `he:好`
export type MarshaledSkillId = string & z.BRAND<`SkillId`>;

export const skillStatePrefix = `s/`;

export const marshalSkillId = (x: Skill | MarshaledSkillId) => {
  if (typeof x === `string`) {
    return x;
  }
  switch (x.type) {
    // Radical skills
    case SkillType.RadicalToEnglish:
    case SkillType.EnglishToRadical:
      return `${SkillTypeMarshal[x.type]}:${x.hanzi}:${x.name}` as MarshaledSkillId;
    case SkillType.RadicalToPinyin:
    case SkillType.PinyinToRadical:
      return `${SkillTypeMarshal[x.type]}:${x.hanzi}:${x.pinyin}` as MarshaledSkillId;
    // Hanzi skills
    case SkillType.HanziWordToEnglish:
    case SkillType.HanziWordToPinyinInitial:
    case SkillType.HanziWordToPinyinFinal:
    case SkillType.HanziWordToPinyinTone:
    case SkillType.EnglishToHanzi:
    case SkillType.PinyinToHanzi:
    case SkillType.ImageToHanzi:
      return `${SkillTypeMarshal[x.type]}:${x.hanzi}` as MarshaledSkillId;
  }
};

export const unmarshalSkillId = (x: string): Skill => {
  const result = /^(.+?):(.+)$/.exec(x);
  invariant(result !== null);
  const [, marshaledSkillType, rest] = result;
  invariant(marshaledSkillType !== undefined);
  invariant(rest !== undefined);

  const skillType =
    SkillTypeUnmarshal[MarshaledSkillType.parse(marshaledSkillType)];

  switch (skillType) {
    case SkillType.RadicalToEnglish:
    case SkillType.EnglishToRadical: {
      const result = /^(.+):(.+)$/.exec(rest);
      invariant(result !== null);
      const [, hanzi, name] = result;
      invariant(hanzi !== undefined);
      invariant(name !== undefined);
      return { type: skillType, hanzi, name };
    }
    case SkillType.RadicalToPinyin:
    case SkillType.PinyinToRadical: {
      const result = /^(.+):(.+)$/.exec(rest);
      invariant(result !== null);
      const [, hanzi, pinyin] = result;
      invariant(hanzi !== undefined);
      invariant(pinyin !== undefined);
      return { type: skillType, hanzi, pinyin };
    }
    case SkillType.HanziWordToEnglish:
    case SkillType.HanziWordToPinyinInitial:
    case SkillType.HanziWordToPinyinFinal:
    case SkillType.HanziWordToPinyinTone:
    case SkillType.EnglishToHanzi:
    case SkillType.PinyinToHanzi:
    case SkillType.ImageToHanzi:
      return { type: skillType, hanzi: rest };
  }
};
export type MarshaledSkillReviewKey = string & z.BRAND<`SkillReviewKey`>;

// Skill state key e.g. `s/he:好`
export type MarshaledSkillStateKey = string & z.BRAND<`SkillStateKey`>;

export const marshalSkillStateKey = (x: Skill | MarshaledSkillId) => {
  return `${skillStatePrefix}${marshalSkillId(x)}` as MarshaledSkillStateKey;
};

export const unmarshalSkillStateKey = (x: string): Skill => {
  const result = /^s\/(.+)$/.exec(x);
  invariant(result !== null);
  const [, skillId] = result;
  invariant(skillId !== undefined);
  return unmarshalSkillId(skillId);
};

interface RizzleTypeDef {
  description?: string;
}

abstract class RizzleType<
  Input = unknown,
  Def extends RizzleTypeDef = RizzleTypeDef,
  Output = unknown,
> {
  readonly _output!: Output;
  readonly _input!: Input;
  readonly _def!: Def;

  abstract getMarshal(): z.ZodType<Output, z.ZodTypeDef, Input>;
  abstract getUnmarshal(): z.ZodType<Input, z.ZodTypeDef, Output>;

  _getIndexes(): IndexDefinitions {
    return {};
  }

  _getAlias(): string | undefined {
    return undefined;
  }

  constructor(def: Def) {
    this._def = def;
  }

  alias(alias: string | undefined): RizzleAliased<this> {
    return RizzleAliased.create(this, alias);
  }

  indexed(indexName: string): RizzleIndexed<this> {
    return RizzleIndexed.create(this, indexName);
  }
}

type RizzleCodecAny = RizzleType;

interface RizzleAliasedDef<T extends RizzleCodecAny = RizzleCodecAny>
  extends RizzleTypeDef {
  innerType: T;
  alias?: string | undefined;
  typeName: `aliased`;
}

export class RizzleAliased<T extends RizzleType> extends RizzleType<
  T[`_input`],
  RizzleAliasedDef<T>,
  T[`_output`]
> {
  getMarshal() {
    return this._def.innerType.getMarshal();
  }
  getUnmarshal() {
    return this._def.innerType.getUnmarshal();
  }
  _getIndexes() {
    return this._def.innerType._getIndexes();
  }
  _getAlias(): string | undefined {
    return this._def.alias;
  }

  static create = <T extends RizzleCodecAny>(
    type: T,
    alias: string | undefined,
  ): RizzleAliased<T> => {
    return new RizzleAliased({ innerType: type, alias, typeName: `aliased` });
  };
}

interface RizzleIndexedDef<T extends RizzleCodecAny = RizzleCodecAny>
  extends RizzleTypeDef {
  innerType: T;
  indexName: string;
  typeName: `indexed`;
}

export class RizzleIndexed<T extends RizzleType> extends RizzleType<
  T[`_input`],
  RizzleIndexedDef<T>,
  T[`_output`]
> {
  getMarshal() {
    return this._def.innerType.getMarshal();
  }
  getUnmarshal() {
    return this._def.innerType.getUnmarshal();
  }
  _getIndexes() {
    return {
      [this._def.indexName]: {
        allowEmpty: false,
        jsonPointer: ``,
      },
      ...this._def.innerType._getIndexes(),
    };
  }
  _getAlias() {
    return this._def.innerType._getAlias();
  }

  static create = <T extends RizzleCodecAny>(
    type: T,
    indexName: string,
  ): RizzleIndexed<T> => {
    return new RizzleIndexed({
      innerType: type,
      indexName,
      typeName: `indexed`,
    });
  };
}

interface RizzleObjectDef<T extends RizzleRawShape = RizzleRawShape>
  extends RizzleTypeDef {
  shape: T;
  typeName: `object`;
}

export class RizzleObject<T extends RizzleRawShape> extends RizzleType<
  RizzleObjectInput<T>,
  RizzleObjectDef<T>,
  RizzleObjectOutput<T>
> {
  getMarshal() {
    const keyMarshal = mapValues(
      this._def.shape,
      (v, k) => (v instanceof RizzleAliased ? v._def.alias : null) ?? k,
    );

    return z
      .object(mapValues(this._def.shape, (v) => v.getMarshal()))
      .transform((x) =>
        mapKeys(x, (_v, k) => keyMarshal[k]),
      ) as unknown as z.ZodType<this[`_output`], z.ZodAnyDef, this[`_input`]>;
  }

  getUnmarshal() {
    const keyMarshal = mapValues(
      this._def.shape,
      (v, k) => (v instanceof RizzleAliased ? v._def.alias : null) ?? k,
    );
    const keyUnmarshal = objectInvert(keyMarshal);

    return z
      .object(
        mapValues(
          mapKeys(this._def.shape, (_v, k) => keyMarshal[k]),
          (x) => x.getUnmarshal(),
        ),
      )
      .transform((x) =>
        mapKeys(x, (_v, k) => keyUnmarshal[k]),
      ) as unknown as z.ZodType<this[`_input`], z.ZodAnyDef, this[`_output`]>;
  }

  _getIndexes() {
    return Object.entries(this._def.shape).reduce<IndexDefinitions>(
      (acc, [key, codec]) => ({
        ...acc,
        ...mapValues(codec._getIndexes(), (v) => ({
          ...v,
          jsonPointer: `/${codec._getAlias() ?? key}${v.jsonPointer}`,
        })),
      }),
      {},
    );
  }

  static create = <T extends RizzleRawShape>(shape: T): RizzleObject<T> => {
    return new RizzleObject({ shape, typeName: `object` });
  };
}

interface RizzlePrimitiveDef<I, O> extends RizzleTypeDef {
  marshal: z.ZodType<O, z.ZodTypeDef, I>;
  unmarshal: z.ZodType<I, z.ZodTypeDef, O>;
  typeName: `primitive`;
}

/**
 * A simple type that can be marshaled and unmarshaled.
 */
export class RizzlePrimitive<I, O> extends RizzleType<
  I,
  RizzlePrimitiveDef<I, O>,
  O
> {
  getMarshal() {
    return this._def.marshal;
  }

  getUnmarshal() {
    return this._def.unmarshal;
  }

  _getIndexes() {
    return {};
  }

  _getAlias(): string | undefined {
    return;
  }

  static create = <I, O>(
    marshal: z.ZodType<O, z.ZodTypeDef, I>,
    unmarshal: z.ZodType<I, z.ZodTypeDef, O>,
  ): RizzlePrimitive<I, O> => {
    return new RizzlePrimitive({ marshal, unmarshal, typeName: `primitive` });
  };
}

export type RizzleRawShape = Record<string, RizzleCodecAny>;

export type RizzleObjectInput<T extends RizzleRawShape> = {
  [K in keyof T]: T[K][`_input`];
};

export type RizzleObjectOutput<T extends RizzleRawShape> = {
  // TODO: this is missing key aliases
  [K in keyof T]: T[K][`_output`];
};

export const rizzle = {
  string: (alias?: string) => {
    const result = RizzlePrimitive.create(z.string(), z.string());
    return alias != null ? result.alias(alias) : result;
  },
  skillType: (alias?: string) => {
    return alias != null ? skillTypeRizzle.alias(alias) : skillTypeRizzle;
  },
  number: (alias?: string) => {
    const result = RizzlePrimitive.create(z.number(), z.number());
    return alias != null ? result.alias(alias) : result;
  },
  timestamp: () =>
    RizzlePrimitive.create(
      z.union([z.number(), z.date().transform((x) => x.getTime())]),
      z.union([
        z
          .string()
          .refine((x) => x.endsWith(`Z`))
          .transform((x) => new Date(x)), // ISO8601
        z.number().transform((x) => new Date(x)), // timestamp
        z.coerce.number().transform((x) => new Date(x)), // timestamp as string (e.g. in key paths)
      ]),
    ),
  enum: <T extends Record<string, string | number>, U extends string = string>(
    e: T,
    mapping: Record<T[keyof T], U>,
  ): RizzlePrimitive<T[keyof T], string> => {
    const marshalMap = new Map<T[keyof T], U>(
      Object.entries(mapping).map(([kStr, v]) => {
        const k = Object.entries(e).find(
          ([, value]) => value.toString() === kStr,
        )?.[1];
        invariant(
          k !== undefined,
          `couldn't find original enum value for ${kStr}`,
        );
        return [k as unknown as T[keyof T], v as U];
      }),
    );

    const unmarshalMap = mapInvert(marshalMap);

    return RizzlePrimitive.create(
      z.custom<T[keyof T]>().transform((x, ctx) => {
        const marshaled = marshalMap.get(x);
        if (marshaled == null) {
          return invalid(ctx, `couldn't marshal value ${x}`);
        }
        return marshaled;
      }),
      z.string().transform((x, ctx) => {
        const unmarshaled = unmarshalMap.get(x as U);
        if (unmarshaled == null) {
          return invalid(ctx, `couldn't unmarshaled value for ${x}`);
        }
        return unmarshaled;
      }),
    );
  },
  object: <S extends RizzleRawShape>(shape: S) => {
    return RizzleObject.create(shape);
  },
  skillId: (alias?: string) => {
    const result = RizzlePrimitive.create(
      z.custom<Skill | MarshaledSkillId>().transform((x) => {
        if (typeof x === `string`) {
          return x;
        }
        switch (x.type) {
          // Radical skills
          case SkillType.RadicalToEnglish:
          case SkillType.EnglishToRadical:
            return `${SkillTypeMarshal[x.type]}:${x.hanzi}:${x.name}` as MarshaledSkillId;
          case SkillType.RadicalToPinyin:
          case SkillType.PinyinToRadical:
            return `${SkillTypeMarshal[x.type]}:${x.hanzi}:${x.pinyin}` as MarshaledSkillId;
          // Hanzi skills
          case SkillType.HanziWordToEnglish:
          case SkillType.HanziWordToPinyinInitial:
          case SkillType.HanziWordToPinyinFinal:
          case SkillType.HanziWordToPinyinTone:
          case SkillType.EnglishToHanzi:
          case SkillType.PinyinToHanzi:
          case SkillType.ImageToHanzi:
            return `${SkillTypeMarshal[x.type]}:${x.hanzi}` as MarshaledSkillId;
        }
      }),
      z.string().transform((x, ctx): Skill => {
        const result = /^(.+?):(.+)$/.exec(x);
        if (result === null) {
          return invalid(ctx, `doesn't match *:* pattern`);
        }

        const [, marshaledSkillType, rest] = result;
        if (marshaledSkillType == null) {
          return invalid(ctx, `couldn't parse skill type (before :)`);
        }
        if (rest == null) {
          return invalid(ctx, `couldn't parse skill params (after :)`);
        }

        const skillType = skillTypeRizzle
          .getUnmarshal()
          .parse(marshaledSkillType);

        switch (skillType) {
          case SkillType.RadicalToEnglish:
          case SkillType.EnglishToRadical: {
            const result = /^(.+):(.+)$/.exec(rest);
            if (result == null) {
              return invalid(
                ctx,
                `couldn't parse ${marshaledSkillType}: params`,
              );
            }
            const [, hanzi, name] = result;
            if (hanzi == null) {
              return invalid(
                ctx,
                `couldn't parse ${marshaledSkillType}: hanzi`,
              );
            }
            if (name == null) {
              return invalid(ctx, `couldn't parse ${marshaledSkillType}: name`);
            }
            return { type: skillType, hanzi, name };
          }
          case SkillType.RadicalToPinyin:
          case SkillType.PinyinToRadical: {
            const result = /^(.+):(.+)$/.exec(rest);
            if (result == null) {
              return invalid(
                ctx,
                `couldn't parse ${marshaledSkillType}: params`,
              );
            }
            const [, hanzi, pinyin] = result;
            if (hanzi == null) {
              return invalid(
                ctx,
                `couldn't parse ${marshaledSkillType}: hanzi`,
              );
            }
            if (pinyin == null) {
              return invalid(
                ctx,
                `couldn't parse ${marshaledSkillType}: pinyin`,
              );
            }
            return { type: skillType, hanzi, pinyin };
          }
          case SkillType.HanziWordToEnglish:
          case SkillType.HanziWordToPinyinInitial:
          case SkillType.HanziWordToPinyinFinal:
          case SkillType.HanziWordToPinyinTone:
          case SkillType.EnglishToHanzi:
          case SkillType.PinyinToHanzi:
          case SkillType.ImageToHanzi:
            return { type: skillType, hanzi: rest };
        }
      }),
    );
    return alias != null ? result.alias(alias) : result;
  },
  schema: <KeyPath extends string, S extends Record<string, RizzleCodecAny>>(
    keyPath: KeyPath,
    shape: S,
  ) => {
    const keyPathVars = keyPathVariableNames(keyPath);

    const keyRizzle = rizzle.object(pick(shape, keyPathVars));
    const valueRizzle = rizzle.object(omit(shape, keyPathVars));

    type Key = (typeof keyRizzle)[`_input`];
    type Value = (typeof valueRizzle)[`_input`];

    const interpolateKey = (key: Key): string => {
      return Object.entries(keyRizzle.getMarshal().parse(key)).reduce<string>(
        (acc, [k, v]): string => acc.replace(`[${k}]`, v as string),
        keyPath,
      );
    };

    return {
      prefix: keyPath,
      valueCodec: valueRizzle,
      getIndexes(): IndexDefinitions {
        return mapValues(valueRizzle._getIndexes(), (v) => ({
          ...v,
          prefix: keyPath.slice(0, keyPath.indexOf(`[`)),
        }));
      },
      async get(tx: ReadTransaction, key: Key): Promise<Value | undefined> {
        const valueData = await tx.get(interpolateKey(key));
        if (valueData === undefined) {
          return valueData;
        }
        return valueRizzle.getUnmarshal().parse(valueData);
      },
      async set(tx: WriteTransaction, key: Key, value: Value) {
        await tx.set(
          interpolateKey(key),
          valueRizzle.getMarshal().parse(value) as ReadonlyJSONValue,
        );
      },
    };
  },
};

export const skillTypeRizzle = rizzle.enum(SkillType, {
  [SkillType.RadicalToEnglish]: `re`,
  [SkillType.EnglishToRadical]: `er`,
  [SkillType.RadicalToPinyin]: `rp`,
  [SkillType.PinyinToRadical]: `pr`,
  [SkillType.HanziWordToEnglish]: `he`,
  [SkillType.HanziWordToPinyinInitial]: `hpi`,
  [SkillType.HanziWordToPinyinFinal]: `hpf`,
  [SkillType.HanziWordToPinyinTone]: `hpt`,
  [SkillType.EnglishToHanzi]: `eh`,
  [SkillType.PinyinToHanzi]: `ph`,
  [SkillType.ImageToHanzi]: `ih`,
});

function invalid(ctx: z.RefinementCtx, message: string): typeof z.NEVER {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message,
  });
  return z.NEVER;
}

export type ExtractVariableNames<T extends string> =
  T extends `${string}[${infer Key}]${infer Rest}`
    ? Key | ExtractVariableNames<Rest>
    : never;

export type KeyPathSchemaShape<
  Prefix extends string,
  T extends Record<string, unknown>,
> = Pick<T, ExtractVariableNames<Prefix>>;

export type ValueSchemaShape<
  Prefix extends string,
  T extends Record<string, unknown>,
> = Omit<T, ExtractVariableNames<Prefix>>;

export const keyPathVariableNames = <T extends string>(
  key: T,
): ExtractVariableNames<T>[] => {
  return (
    key
      .match(/\[(.+?)\]/g)
      ?.map((key) => key.slice(1, -1) as ExtractVariableNames<T>) ?? []
  );
};

export type Timestamp = number;

export enum IndexName {
  Null = `Null`,
  SkillStateByDue = `SkillStateByDue`,
}

export const indexes = {
  [IndexName.Null]: {
    allowEmpty: true,
    prefix: `///`,
    jsonPointer: `/d` satisfies MarshaledSkillStateValueJsonPath,
  },
  [IndexName.SkillStateByDue]: {
    allowEmpty: false,
    prefix: skillStatePrefix,
    jsonPointer: `/d` satisfies MarshaledSkillStateValueJsonPath,
  },
} satisfies IndexDefinitions;

export const indexUnmarshalers = {
  [IndexName.Null]: () => null,
  [IndexName.SkillStateByDue]: unmarshalSkillStateJson,
};

export async function indexScan<
  I extends IndexName,
  Unmarshaled = ReturnType<(typeof indexUnmarshalers)[I]>,
>(tx: ReadTransaction, indexName: I, limit?: number): Promise<Unmarshaled[]> {
  // Work around https://github.com/rocicorp/replicache/issues/1039
  const iter = tx.scan({ indexName }).entries();
  const results =
    limit != null ? await iterTake(iter, limit) : await iter.toArray();
  const unmarshal = indexUnmarshalers[indexName];

  return (
    results
      // Strip off the secondary key, put it back in the normal "no index" mode
      // of [key, value].
      .map(([[, key], value]) => unmarshal([key, value]) as Unmarshaled)
  );
}

export async function* indexScanIter<
  I extends IndexName,
  Unmarshaled = ReturnType<(typeof indexUnmarshalers)[I]>,
>(tx: ReadTransaction, indexName: I): AsyncGenerator<Unmarshaled> {
  // HACK: convoluted workaround to fix a bug in Safari where the transaction
  // would be prematurely closed with:
  //
  // > InvalidStateError: Failed to execute 'objectStore' on 'IDBTransaction':
  // > The transaction finished.
  //
  // See also https://github.com/rocicorp/replicache/issues/486
  //
  // This approach synchronously loads a page of results at a time and then
  // releases the transaction. This is not ideal, but seems better than using
  // `.toArray()` which doesn't honor `limit` when using an index, so it would
  // load the entire index at a time (see
  // https://github.com/rocicorp/replicache/issues/1039).

  const unmarshal = indexUnmarshalers[indexName];
  const pageSize = 50;
  let page: [string, ReadonlyJSONValue][];
  let startKey: string | undefined;

  do {
    page = [];

    for await (const [[indexKey, key], value] of tx
      .scan({
        indexName,
        start:
          startKey != null ? { key: startKey, exclusive: true } : undefined,
      })
      .entries()) {
      startKey = indexKey;
      page.push([key, value]);
      if (page.length === pageSize) {
        break;
      }
    }

    for (const kv of page) {
      yield unmarshal(kv) as Unmarshaled;
    }
  } while (page.length > 0);
}
