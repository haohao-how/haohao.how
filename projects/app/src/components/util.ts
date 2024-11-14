import * as Sentry from "@sentry/react-native";
import * as Haptics from "expo-haptics";
import { useCallback, useInsertionEffect, useRef } from "react";
import { Platform } from "react-native";

/**
 * Alias for {@link Sentry.captureException}.
 */
export function sentryCaptureException(e: unknown) {
  // eslint-disable-next-line no-console
  console.error(e);
  Sentry.captureException(e);
}

export function hapticImpactIfMobile() {
  if (Platform.OS === `ios` || Platform.OS === `android`) {
    // Calling impactAsync on an unsupported platform (e.g. web) throws an
    // exception and will crash the app.
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
      (e: unknown) => {
        sentryCaptureException(e);
      },
    );
  }
}

type VoidFunction = (...args: never[]) => void;

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
  const latestRef = useRef(shouldNotBeInvokedBeforeMount as TCallback);

  useInsertionEffect(() => {
    latestRef.current = callback;
  }, [callback]);

  // @ts-expect-error: it's fine
  return useCallback((...args) => {
    // Avoid `this` referring to the ref when invoking the function.
    latestRef.current.apply(undefined, args);
  }, []);
}

function shouldNotBeInvokedBeforeMount() {
  throw new Error(
    `invoking useEvent before mounting violates the rules of React`,
  );
}
