import { invariant } from "@haohaohow/lib/invariant";
import type { DeepReadonly } from "ts-essentials";

export const deepReadonly = <T>(value: T) => value as DeepReadonly<T>;

export async function iterTake<T>(
  iter: AsyncIterableIterator<T>,
  limit: number,
): Promise<T[]> {
  const results: T[] = [];
  for await (const x of iter) {
    results.push(x);
    if (results.length === limit) {
      break;
    }
  }
  return results;
}

export function arrayFilterUniqueWithKey<T>(
  keyFn: (x: T) => unknown = (x) => x,
): (item: T) => boolean {
  const seen = new Set();
  return (x): boolean => {
    const key = keyFn(x);
    const unseen = !seen.has(key);
    if (unseen) {
      seen.add(key);
    }
    return unseen;
  };
}

export function readonlyMapSet<K, V>(
  map: ReadonlyMap<K, V>,
  key: K,
  value: V,
): ReadonlyMap<K, V> {
  const copy = new Map(map);
  copy.set(key, value);
  return copy;
}

export function mergeMaps<K, V>(
  a: ReadonlyMap<K, V>,
  b: ReadonlyMap<K, V>,
): Map<K, V> {
  const result = new Map(a);
  for (const [k, v] of b) {
    result.set(k, v);
  }
  return result;
}

export function randomOne<T>(items: readonly T[]): T {
  invariant(
    items.length > 0,
    `cannot pick one random item from an empty array`,
  );
  return items[Math.floor(Math.random() * items.length)] as T;
}

export function sortComparatorNumber(): (a: number, b: number) => number;
export function sortComparatorNumber(): (fn: (x: unknown) => number) => number;
export function sortComparatorNumber<T>(
  fn?: (x: T) => number,
): (a: T, b: T) => number {
  fn ??= (x) => x as unknown as number;
  return (a, b) => fn(a) - fn(b);
}

export function sortComparatorString(): (a: string, b: string) => number;
export function sortComparatorString<T>(
  fn: (x: T) => string,
): (a: T, b: T) => number;
export function sortComparatorString<T>(
  fn?: (x: T) => string,
): (a: T, b: T) => number {
  fn ??= (x) => x as unknown as string;
  return (a, b) => fn(a).localeCompare(fn(b));
}
