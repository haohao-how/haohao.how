import { invariant } from "@haohaohow/lib/invariant";

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

export function readonlyMapSet<K, V>(
  map: ReadonlyMap<K, V>,
  key: K,
  value: V,
): ReadonlyMap<K, V> {
  const copy = new Map(map);
  copy.set(key, value);
  return copy;
}

export function randomOne<T>(items: readonly T[]): T {
  invariant(
    items.length > 0,
    `cannot pick one random item from an empty array`,
  );
  return items[Math.floor(Math.random() * items.length)] as T;
}
