import { Platform } from "react-native";

/**
 * Helper for `useEffect` + `addEventListener` + `removeEventListener`
 * boilerplate. Web only.
 *
 * @example
 *
 *  useEffect(
 *    () => effectEventListener(`storage`, (event) => {
 *      // …
 *    }),
 *    []
 *  );
 */
export function effectWebEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => void,
): undefined | (() => void) {
  if (Platform.OS === `web`) {
    const ac = new AbortController();
    addEventListener(type, listener, { signal: ac.signal });
    return () => {
      ac.abort();
    };
  }
}
