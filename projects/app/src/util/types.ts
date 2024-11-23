import { PropsOf } from "@/components/types";
import { TypedNavigator } from "@react-navigation/native";
import { AnyFunction } from "ts-essentials";

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

export type StackNavigationFor<
  Stack,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ScreenListenersFn = Stack extends TypedNavigator<any, any>
    ? PropsOf<Stack[`Navigator`]>[`screenListeners`]
    : never,
> = ScreenListenersFn extends AnyFunction
  ? Parameters<ScreenListenersFn>[0][`navigation`]
  : never;
