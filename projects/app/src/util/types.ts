import type { TypedNavigator } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

type MaximumAllowedBoundary = 50;

// See https://stackoverflow.com/a/69787886
export type RepeatedSequence2<
  Tuple extends unknown[],
  Result extends unknown[] = [],
  Count extends readonly number[] = [],
> = Count[`length`] extends MaximumAllowedBoundary
  ? Result
  : Tuple extends []
    ? []
    : Result extends []
      ? RepeatedSequence2<Tuple, Tuple, [...Count, 1]>
      : RepeatedSequence2<Tuple, Result | [...Result, ...Tuple], [...Count, 1]>;

export type ValuesOf<X> = X[keyof X];

export type StackNavigationFor<Stack> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Stack extends TypedNavigator<infer T, any, any, any, any>
    ? NativeStackNavigationProp<T>
    : never;
