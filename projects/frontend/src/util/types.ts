type MaximumAllowedBoundary = 50;

// See https://stackoverflow.com/a/69787886
export type RepeatedSequence2<
  Tuple extends unknown[],
  Result extends unknown[] = [],
  Count extends readonly number[] = [],
> = Count["length"] extends MaximumAllowedBoundary
  ? Result
  : Tuple extends []
    ? []
    : Result extends []
      ? RepeatedSequence2<Tuple, Tuple, [...Count, 1]>
      : RepeatedSequence2<Tuple, Result | [...Result, ...Tuple], [...Count, 1]>;

export type ValuesOf<X> = X[keyof X];
