import { mapInvert, objectInvert } from "@/util/collections";
import { invariant } from "@haohaohow/lib/invariant";
import mapKeys from "lodash/mapKeys";
import mapValues from "lodash/mapValues";
import memoize from "lodash/memoize";
import omit from "lodash/omit";
import pick from "lodash/pick";
import {
  IndexDefinition,
  IndexDefinitions,
  MutatorDefs,
  ReadonlyJSONValue,
  ReadTransaction,
  Replicache,
  ReplicacheOptions,
  WriteTransaction,
} from "replicache";
import { z } from "zod";
import { indexScanIter } from "./marshal";

interface RizzleTypeDef {
  description?: string;
}

abstract class RizzleType<
  Def extends RizzleTypeDef = RizzleTypeDef,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Input = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Marshaled = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Output = any,
> {
  readonly _input!: Input;
  readonly _output!: Output;
  readonly _marshaled!: Marshaled;
  readonly _def!: Def;

  abstract getMarshal(): z.ZodType<Marshaled, z.ZodTypeDef, Input>;
  abstract getUnmarshal(): z.ZodType<Output, z.ZodTypeDef, Marshaled>;

  _getIndexes(): IndexDefinitions {
    return {};
  }

  _getAlias(): string | undefined {
    return undefined;
  }

  constructor(def: Def) {
    this._def = def;
  }

  alias(alias: string): RizzleTypeAlias<this> {
    return RizzleTypeAlias.create(this, alias);
  }

  nullable(): RizzleNullable<this> {
    return RizzleNullable.create(this);
  }

  indexed<IndexName extends string>(
    indexName: IndexName,
  ): RizzleIndexed<this, IndexName> {
    return RizzleIndexed.create(this, indexName);
  }
}

interface RizzleNullableDef<T extends RizzleType> extends RizzleTypeDef {
  innerType: T;
  typeName: `nullable`;
}

export class RizzleNullable<T extends RizzleType> extends RizzleType<
  RizzleNullableDef<T>,
  T[`_input`] | null,
  T[`_marshaled`] | null,
  T[`_output`] | null
> {
  getMarshal() {
    return this._def.innerType.getMarshal().nullable();
  }
  getUnmarshal() {
    return this._def.innerType.getUnmarshal().nullable();
  }
  _getIndexes() {
    return this._def.innerType._getIndexes();
  }
  _getAlias(): string | undefined {
    return this._def.innerType._getAlias();
  }

  static create = <T extends RizzleType>(type: T): RizzleNullable<T> => {
    return new RizzleNullable({ innerType: type, typeName: `nullable` });
  };
}

interface RizzleTypeAliasDef<T extends RizzleType> extends RizzleTypeDef {
  innerType: T;
  alias?: string | undefined;
  typeName: `alias`;
}

export class RizzleTypeAlias<T extends RizzleType> extends RizzleType<
  RizzleTypeAliasDef<T>,
  T[`_input`],
  T[`_marshaled`],
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

  static create = <T extends RizzleType>(
    type: T,
    alias: string | undefined,
  ): RizzleTypeAlias<T> => {
    return new RizzleTypeAlias({ innerType: type, alias, typeName: `alias` });
  };
}

interface RizzleIndexedDef<T extends RizzleType, IndexName extends string>
  extends RizzleTypeDef {
  innerType: T;
  indexName: IndexName;
  typeName: `indexed`;
}

export class RizzleIndexed<
  T extends RizzleType,
  IndexName extends string,
> extends RizzleType<
  RizzleIndexedDef<T, IndexName>,
  T[`_input`],
  T[`_marshaled`],
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

  static create = <T extends RizzleType, IndexName extends string>(
    type: T,
    indexName: IndexName,
  ): RizzleIndexed<T, IndexName> => {
    return new RizzleIndexed({
      innerType: type,
      indexName,
      typeName: `indexed`,
    });
  };
}

interface RizzleObjectDef<T extends RizzleRawObject = RizzleRawObject>
  extends RizzleTypeDef {
  shape: T;
  typeName: `object`;
}

export class RizzleObject<T extends RizzleRawObject> extends RizzleType<
  RizzleObjectDef<T>,
  RizzleObjectInput<T>,
  RizzleObjectMarshaled<T>,
  RizzleObjectOutput<T>
> {
  #keyToAlias: Record<string, string>;
  #aliasToKey: Record<string, string>;

  constructor(def: RizzleObjectDef<T>) {
    super(def);

    this.#keyToAlias = mapValues(this._def.shape, (v, k) => v._getAlias() ?? k);
    this.#aliasToKey = objectInvert(this.#keyToAlias);
  }

  getMarshal() {
    return z
      .object(mapValues(this._def.shape, (v) => v.getMarshal()))
      .transform((x) =>
        mapKeys(x, (_v, k) => this.#keyToAlias[k]),
      ) as unknown as z.ZodType<
      this[`_marshaled`],
      z.ZodAnyDef,
      this[`_input`]
    >;
  }

  getUnmarshal() {
    return z
      .object(
        mapValues(
          mapKeys(this._def.shape, (_v, k) => this.#keyToAlias[k]),
          (x) => x.getUnmarshal(),
        ),
      )
      .transform((x) =>
        mapKeys(x, (_v, k) => this.#aliasToKey[k]),
      ) as unknown as z.ZodType<
      this[`_output`],
      z.ZodAnyDef,
      this[`_marshaled`]
    >;
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

  static create = <T extends RizzleRawObject>(shape: T): RizzleObject<T> => {
    return new RizzleObject({ shape, typeName: `object` });
  };
}

interface RizzlePrimitiveDef<I, M, O> extends RizzleTypeDef {
  marshal: z.ZodType<M, z.ZodTypeDef, I>;
  unmarshal: z.ZodType<O, z.ZodTypeDef, M>;
  typeName: `primitive`;
}

/**
 * A simple type that can be marshaled and unmarshaled.
 */
export class RizzlePrimitive<I, M, O = I> extends RizzleType<
  RizzlePrimitiveDef<I, M, O>,
  I,
  M,
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

  marshal(options: this[`_input`]): this[`_marshaled`] {
    return this._def.marshal.parse(options);
  }

  unmarshal(options: this[`_marshaled`]): this[`_output`] {
    return this._def.unmarshal.parse(options);
  }

  static create = <I, M, O>(
    marshal: z.ZodType<M, z.ZodTypeDef, I>,
    unmarshal: z.ZodType<O, z.ZodTypeDef, M>,
  ): RizzlePrimitive<I, M, O> => {
    return new RizzlePrimitive({ marshal, unmarshal, typeName: `primitive` });
  };
}

abstract class RizzleRoot<Def extends RizzleTypeDef = RizzleTypeDef> {
  _def: Def;

  constructor(def: Def) {
    this._def = def;
  }
}

type RizzleRawSchemaForKeyPath<KeyPath extends string> = Record<
  ExtractVariableNames<KeyPath>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RizzleType<RizzleTypeDef, any, string>
>;

type KVKeyType<
  S extends RizzleRawObject,
  KeyPath extends string,
> = RizzleObject<Pick<S, ExtractVariableNames<KeyPath>>>;
type KVValueType<
  S extends RizzleRawObject,
  KeyPath extends string,
> = RizzleObject<Omit<S, ExtractVariableNames<KeyPath>>>;

interface RizzleKVDef<KeyPath extends string, S extends RizzleRawObject>
  extends RizzleTypeDef {
  keyPath: KeyPath;
  keyType: KVKeyType<S, KeyPath>;
  valueType: KVValueType<S, KeyPath>;
  interpolateKey: (key: KVKeyType<S, KeyPath>[`_input`]) => string;
  uninterpolateKey: (
    key: string,
  ) => KVKeyType<S, KeyPath>[`_output`] | undefined;
  typeName: `keyValue`;
}

export class RizzleKV<
  KeyPath extends string,
  S extends RizzleRawObject,
> extends RizzleRoot<RizzleKVDef<KeyPath, S>> {
  async has(
    tx: ReadTransaction,
    key: KVKeyType<S, KeyPath>[`_input`],
  ): Promise<boolean> {
    return await tx.has(this.marshalKey(key));
  }

  async get(
    tx: ReadTransaction,
    key: KVKeyType<S, KeyPath>[`_input`],
  ): Promise<KVValueType<S, KeyPath>[`_output`] | undefined> {
    const valueData = await tx.get(this.marshalKey(key));
    if (valueData === undefined) {
      return valueData;
    }
    return this._def.valueType.getUnmarshal().parse(valueData);
  }

  async set(
    tx: WriteTransaction,
    key: KVKeyType<S, KeyPath>[`_input`],
    value: KVValueType<S, KeyPath>[`_input`],
  ) {
    await tx.set(
      this.marshalKey(key),
      this.marshalValue(value) as ReadonlyJSONValue,
    );
  }

  getIndexes() {
    return mapValues(this._def.valueType._getIndexes(), (v) => {
      const firstVarIndex = this._def.keyPath.indexOf(`[`);
      return {
        ...v,
        prefix:
          firstVarIndex > 0
            ? this._def.keyPath.slice(0, firstVarIndex)
            : this._def.keyPath,
      };
    }) as Record<RizzleIndexNames<KVValueType<S, KeyPath>>, IndexDefinition>;
  }

  marshalKey(options: KVKeyType<S, KeyPath>[`_input`]) {
    return this._def.interpolateKey(options);
  }

  marshalValue(
    options: KVValueType<S, KeyPath>[`_input`],
  ): KVValueType<S, KeyPath>[`_marshaled`] {
    return this._def.valueType.getMarshal().parse(options);
  }

  static create = <
    KeyPath extends string,
    S extends RizzleRawSchemaForKeyPath<KeyPath>,
  >(
    keyPath: KeyPath,
    shape: S,
  ): RizzleKV<KeyPath, S> => {
    const keyPathVars = keyPathVariableNames(keyPath);

    const keyType = object(pick(shape, keyPathVars));
    const valueType = object(omit(shape, keyPathVars));

    const interpolateKey = (key: KVKeyType<S, KeyPath>[`_input`]): string => {
      return Object.entries(keyType.getMarshal().parse(key)).reduce<string>(
        (acc, [k, v]): string => acc.replace(`[${k}]`, v as string),
        keyPath,
      );
    };

    const uninterpolateKey = buildKeyPathRegex(keyPath);

    return new RizzleKV({
      keyPath,
      keyType,
      valueType,
      interpolateKey,
      uninterpolateKey,
      typeName: `keyValue`,
    });
  };
}

interface RizzleMutatorDef<P extends RizzleRawObject> extends RizzleTypeDef {
  args: RizzleObject<P>;
  alias?: string;
  typeName: `mutator`;
}

export class RizzleMutator<P extends RizzleRawObject> extends RizzleRoot<
  RizzleMutatorDef<P>
> {
  alias(alias: string): RizzleMutator<P> {
    return new RizzleMutator({
      ...this._def,
      alias,
    });
  }

  marshalArgs(options: RizzleObjectInput<P>): RizzleObjectMarshaled<P> {
    return this._def.args.getMarshal().parse(options);
  }

  static create = <P extends RizzleRawObject>(
    parameters: RizzleObject<P>,
  ): RizzleMutator<P> => {
    return new RizzleMutator({ args: parameters, typeName: `mutator` });
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RizzleAnyMutator = RizzleMutator<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RizzleAnyKV = RizzleKV<string, any>;

export type RizzleRawObject = Record<string, RizzleType>;

export type RizzleRawSchema = Record<string, RizzleRoot>;

export type RizzleObjectInput<T extends RizzleRawObject> = {
  [K in keyof T]: T[K][`_input`];
};

export type RizzleObjectMarshaled<T extends RizzleRawObject> = {
  // TODO: this is missing key aliases
  [K in keyof T]: T[K][`_marshaled`];
};

export type RizzleObjectOutput<T extends RizzleRawObject> = {
  [K in keyof T]: T[K][`_output`];
};

export type RizzleIndexNames<T extends RizzleType> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends RizzleIndexed<any, infer IndexName>
    ? IndexName
    : T extends RizzleTypeAlias<infer Wrapped>
      ? RizzleIndexNames<Wrapped>
      : T extends RizzleNullable<infer Wrapped>
        ? RizzleIndexNames<Wrapped>
        : T extends RizzleObject<infer Shape>
          ? {
              [K in keyof Shape]: RizzleIndexNames<Shape[K]>;
            }[keyof Shape]
          : never;

type WithoutFirstArgument<T> = T extends (
  arg1: never,
  ...args: infer P
) => infer R
  ? (...args: P) => R
  : never;

export type RizzleReplicacheMutatorTx<S extends RizzleRawSchema> = {
  [K in keyof S as S[K] extends RizzleAnyKV
    ? K
    : never]: S[K] extends RizzleAnyKV
    ? { [KK in `get` | `set` | `has`]: WithoutFirstArgument<S[K][KK]> }
    : never;
} & { tx: WriteTransaction };

export type RizzleReplicacheMutators<S extends RizzleRawSchema> = {
  [K in keyof S as S[K] extends RizzleMutator<infer _>
    ? K
    : never]: S[K] extends RizzleMutator<infer P>
    ? (
        tx: RizzleReplicacheMutatorTx<S>,
        options: RizzleObject<P>[`_input`],
      ) => Promise<void>
    : never;
};

export type RizzleDrizzleMutators<S extends RizzleRawSchema, Tx> = {
  [K in keyof S as S[K] extends RizzleMutator<infer _>
    ? K
    : never]: S[K] extends RizzleMutator<infer P>
    ? (
        tx: Tx,
        userId: string,
        options: RizzleObject<P>[`_output`],
      ) => Promise<void>
    : never;
};

export type RizzleReplicacheAnyMutator = (
  tx: RizzleReplicacheMutatorTx<never>,
  options: unknown,
) => Promise<void>;

export type RizzleReplicacheMutate<S extends RizzleRawSchema> = {
  [K in keyof S]: S[K] extends RizzleMutator<infer P>
    ? (options: RizzleObject<P>[`_input`]) => Promise<void>
    : never;
};

export type RizzleReplicacheQuery<S extends RizzleRawSchema> = {
  [K in keyof S as S[K] extends RizzleAnyKV
    ? K
    : never]: S[K] extends RizzleAnyKV
    ? Record<
        RizzleIndexNames<S[K][`_def`][`valueType`]>,
        (
          tx: ReadTransaction,
        ) => AsyncGenerator<
          [
            S[K][`_def`][`keyType`][`_output`],
            S[K][`_def`][`valueType`][`_output`],
          ]
        >
      > &
        Pick<S[K], `get` | `has`>
    : never;
};

const string = (alias?: string) => {
  const result = RizzlePrimitive.create(z.string(), z.string());
  return alias != null ? result.alias(alias) : result;
};

const number = (alias?: string) => {
  const result = RizzlePrimitive.create(z.number(), z.number());
  return alias != null ? result.alias(alias) : result;
};

/**
 * A UNIX timestamp number.
 *
 * Be careful using this for storage (`r.keyValue`) because it can't be indexed
 * and if it's used in a key path it isn't a stable length so it's not
 * guaranteed to sort correctly. For storage use {@link datetime} instead.
 */
const timestamp = memoize(() =>
  RizzlePrimitive.create(
    z.union([z.number(), z.date().transform((x) => x.getTime())]),
    z.union([
      z
        .string()
        .refine((x) => x.endsWith(`Z`))
        .transform((x) => new Date(x)), // ISO8601
      z.number().transform((x) => new Date(x)), // timestamp
      z.coerce.number().transform((x) => new Date(x)),
    ]),
  ),
);

/**
 * Stores as ISO-8601 so that it can be indexed and sorted reliably. (numbers
 * can't be indexed in replicache).
 */
const datetime = memoize(() =>
  RizzlePrimitive.create(
    z.date().transform((x) => x.toISOString()),
    z
      .string()
      .refine((x) => x.endsWith(`Z`))
      .transform((x) => new Date(x)), // ISO8601
  ),
);

type EnumType = Record<string, string | number>;

const enum_ = <T extends EnumType, U extends string = string>(
  e: T,
  mapping: Record<T[keyof T], U>,
): RizzlePrimitive<T[keyof T], string, T[keyof T]> => {
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
};

const literal = <T extends RizzleType, const V extends T[`_input`]>(
  value: V,
  type: T,
) =>
  RizzlePrimitive.create(
    z.literal(value).pipe(type.getMarshal()),
    type
      .getUnmarshal()
      .pipe(z.literal(value))
      .refine((x): x is V => x === value),
  );

const object = <S extends RizzleRawObject>(shape: S) => {
  return RizzleObject.create(shape);
};

const keyValue = <
  KeyPath extends string,
  S extends RizzleRawSchemaForKeyPath<KeyPath>,
>(
  keyPath: KeyPath,
  shape: S,
) => {
  return RizzleKV.create(keyPath, shape);
};

const mutator = <I extends RizzleRawObject>(input: I) =>
  RizzleMutator.create(object(input));

export type RizzleReplicache<
  S extends RizzleRawSchema,
  _MutatorDefs extends MutatorDefs = MutatorDefs,
> = {
  replicache: Replicache<_MutatorDefs>;
  mutate: RizzleReplicacheMutate<S>;
  query: RizzleReplicacheQuery<S>;
  [Symbol.asyncDispose]: () => Promise<void>;
};

const replicache = <
  S extends RizzleRawSchema,
  _MutatorDefs extends MutatorDefs = MutatorDefs,
>(
  replicacheOptions: Omit<ReplicacheOptions<never>, `indexes` | `mutators`>,
  schema: S,
  mutators: RizzleReplicacheMutators<S>,
  ctor?: (options: ReplicacheOptions<MutatorDefs>) => Replicache<_MutatorDefs>,
): RizzleReplicache<S, _MutatorDefs> => {
  const indexes = Object.fromEntries(
    Object.entries(schema).flatMap(([k, v]) =>
      v instanceof RizzleKV
        ? Object.entries(
            mapKeys(v.getIndexes(), (_v, indexName) => `${k}.${indexName}`),
          )
        : [],
    ),
  );

  const mutate = Object.fromEntries(
    Object.entries(schema).flatMap(([k, v]) =>
      v instanceof RizzleMutator
        ? [
            [
              k,
              (options: typeof v._def.args._input) => {
                const mutator = replicache.mutate[v._def.alias ?? k];
                invariant(mutator != null, `mutator ${k} not found`);
                return mutator(v._def.args.getMarshal().parse(options));
              },
            ],
          ]
        : [],
    ),
  ) as RizzleReplicacheMutate<S>;

  const mutatorsWithMarhsaling = Object.fromEntries(
    Object.entries(schema).flatMap(([k, v]) =>
      v instanceof RizzleMutator
        ? [
            [
              v._def.alias ?? k,
              (tx: WriteTransaction, options: typeof v._def.args._input) => {
                const mutator = mutators[k as keyof typeof mutators];
                invariant(
                  (mutator as unknown) != null,
                  `mutator ${k} not found`,
                );

                const tx2 = Object.assign(
                  { tx },
                  Object.fromEntries(
                    Object.entries(schema).flatMap(([k, v]) =>
                      v instanceof RizzleKV
                        ? [
                            [
                              k,
                              Object.assign(
                                {
                                  has: v.has.bind(v, tx),
                                  get: v.get.bind(v, tx),
                                  set: v.set.bind(v, tx),
                                },
                                mapValues(
                                  v.getIndexes(),
                                  (_v, indexName) => (tx: ReadTransaction) =>
                                    indexScanIter(
                                      tx,
                                      `${k}.${indexName}`,
                                      (k) =>
                                        v._def.keyType
                                          .getUnmarshal()
                                          .parse(v._def.uninterpolateKey(k)),
                                      (x) =>
                                        v._def.valueType
                                          .getUnmarshal()
                                          .parse(x),
                                    ),
                                ),
                              ),
                            ],
                          ]
                        : [],
                    ),
                  ),
                ) as unknown as RizzleReplicacheMutatorTx<S>;

                return mutator(tx2, v._def.args.getUnmarshal().parse(options));
              },
            ],
          ]
        : [],
    ),
  ) as unknown as MutatorDefs;

  const options = {
    ...replicacheOptions,
    indexes,
    mutators: mutatorsWithMarhsaling as _MutatorDefs,
  };
  const replicache = ctor?.(options) ?? new Replicache(options);

  const query = Object.fromEntries(
    Object.entries(schema).flatMap(([k, v]) =>
      v instanceof RizzleKV
        ? [
            [
              k,
              Object.assign(
                { get: v.get.bind(v), has: v.has.bind(v) },
                mapValues(
                  v.getIndexes(),
                  (_v, indexName) => (tx: ReadTransaction) => {
                    return indexScanIter(
                      tx,
                      `${k}.${indexName}`,
                      (k) =>
                        v._def.keyType
                          .getUnmarshal()
                          .parse(v._def.uninterpolateKey(k)),
                      (x) => v._def.valueType.getUnmarshal().parse(x),
                    );
                  },
                ),
              ),
            ],
          ]
        : [],
    ),
  ) as unknown as RizzleReplicacheQuery<S>;

  return {
    replicache,
    query,
    mutate,
    [Symbol.asyncDispose]: () => replicache.close(),
  };
};

export const mutationSchema = z
  .object({
    id: z.number(),
    clientID: z.string(),
    name: z.string(),
    args: z.unknown(),
    timestamp: z.number(),
  })
  .strict()
  .transform((x) =>
    // Translate convention of initialisms, e.g. `ID` to `Id`
    ({
      id: x.id,
      clientId: x.clientID,
      name: x.name,
      args: x.args,
      timestamp: x.timestamp,
    }),
  );

export type Mutation = z.infer<typeof mutationSchema>;

export const pushRequestSchema = z
  .object({
    profileID: z.string(),
    clientGroupID: z.string(),
    pushVersion: z.literal(1),
    schemaVersion: z.string(),
    mutations: z.array(mutationSchema),
  })
  .strict()
  .transform((v) =>
    // Translate convention of initialisms, e.g. `ID` to `Id`
    ({
      profileId: v.profileID,
      clientGroupId: v.clientGroupID,
      pushVersion: v.pushVersion,
      schemaVersion: v.schemaVersion,
      mutations: v.mutations,
    }),
  );

export type PushRequest = z.infer<typeof pushRequestSchema>;

export const cookieSchema = z.object({
  order: z.number(),
  cvrID: z.string(),
});

export type Cookie = z.infer<typeof cookieSchema>;

export const pullRequestSchema = z
  .object({
    pullVersion: z.literal(1),
    clientGroupID: z.string(),
    cookie: cookieSchema.nullable(),
    profileID: z.string(),
    schemaVersion: z.string(),
  })
  .strict()
  .transform((v) =>
    // Translate convention of initialisms, e.g. `ID` to `Id`
    ({
      pullVersion: v.pullVersion,
      clientGroupId: v.clientGroupID,
      cookie: v.cookie,
      profileId: v.profileID,
      schemaVersion: v.schemaVersion,
    }),
  );

export type PullRequest = z.infer<typeof pullRequestSchema>;

export const makeDrizzleMutationHandler = <S extends RizzleRawSchema, Tx>(
  schema: S,
  mutators: RizzleDrizzleMutators<S, Tx>,
) => {
  const handlersWithUnmarshaling = Object.fromEntries(
    Object.entries(schema).flatMap(([k, v]) =>
      v instanceof RizzleMutator
        ? [
            [
              v._def.alias ?? k,
              (tx: Tx, userId: string, mutation: Mutation) => {
                const mutator =
                  k in mutators ? mutators[k as keyof typeof mutators] : null;
                invariant(mutator != null, `mutator ${k} not found`);

                return mutator(
                  tx,
                  userId,
                  v._def.args.getUnmarshal().parse(mutation.args),
                );
              },
            ],
          ]
        : [],
    ),
  );

  return async (tx: Tx, userId: string, mutation: Mutation): Promise<void> => {
    const mutator = handlersWithUnmarshaling[mutation.name];
    invariant(mutator != null);
    await mutator(tx, userId, mutation);
  };
};

export const r = {
  string,
  number,
  timestamp,
  datetime,
  enum: enum_,
  object,
  keyValue,
  mutator,
  primitive: RizzlePrimitive.create,
  replicache,
  literal,
};

export function invalid(ctx: z.RefinementCtx, message: string): typeof z.NEVER {
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

export const keyPathVariableNames = <T extends string>(
  key: T,
): ExtractVariableNames<T>[] => {
  return (
    key
      .match(/\[(.+?)\]/g)
      ?.map((key) => key.slice(1, -1) as ExtractVariableNames<T>) ?? []
  );
};

export const parseKeyPath = <T extends string>(
  keyPath: T,
  key: string,
): Record<ExtractVariableNames<T>, string> => {
  return buildKeyPathRegex(keyPath)(key);
};

export const buildKeyPathRegex = <T extends string>(keyPath: T) => {
  const keyPathVars = keyPathVariableNames(keyPath);

  const regexString = keyPathVars.reduce<string>((acc, key) => {
    return acc.replace(regexpEscape(`[${key}]`), `(?<${key}>.+?)`);
  }, regexpEscape(keyPath));
  const regex = new RegExp(`^${regexString}$`);

  return (input: string) => {
    const result = regex.exec(input)?.groups;
    invariant(result != null, `couldn't parse key ${input} using ${keyPath}`);
    // fix the prototype
    return { ...result } as Record<ExtractVariableNames<T>, string>;
  };
};
export type Timestamp = number;

function regexpEscape(s: string): string {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, `\\$&`);
}
