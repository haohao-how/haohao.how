import * as Sentry from "@sentry/react-native";
import * as Haptics from "expo-haptics";
import { useCallback, useInsertionEffect, useRef } from "react";
import { Platform } from "react-native";

export function hapticImpactIfMobile() {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    // Calling impactAsync on an unsupported platform (e.g. web) throws an
    // exception and will crash the app.
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
      (e: unknown) => {
        Sentry.captureException(e);
      },
    );
  }
}

type VoidFunction = (...args: never[]) => void;
// Avoid allocating empty arrays unnecessarily
const emptyArray = [] as const;

/**
 * Similar to `useCallback` but offers better memoization for event handlers.
 *
 * Differences from `useCallback`:
 *
 * - The returned function is a stable reference, and will always be the same
 *   between renders.
 * - There is no dependency array.
 * - Properties or state accessed within the callback will always be "current"
 *   (good enough for event handlers anyway).
 */
export function useEventCallback<TCallback extends VoidFunction>(
  callback: TCallback,
): TCallback {
  // Keep track of the latest callback
  const latestRef = useRef<TCallback>(
    useEventCallback_shouldNotBeInvokedBeforeMount as TCallback,
  );

  useInsertionEffect(() => {
    latestRef.current = callback;
  }, [callback]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    function (...args) {
      // Avoid `this` referring to the ref when invoking the function.
      latestRef.current.apply(undefined, args);
    } as TCallback,
    emptyArray,
  );
}

function useEventCallback_shouldNotBeInvokedBeforeMount() {
  throw new Error(
    "invoking useEvent before mounting violates the rules of React",
  );
}
