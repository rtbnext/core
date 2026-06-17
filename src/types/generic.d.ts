export type TAggregator =
  | 'all' | 'first' | 'last' | 'sum' | 'min' | 'max' | 'mean'
  | ( ( values: readonly T[ K ][] ) => R );

export type TMeasuredResult< R > = {
  result: R;
  ms: number;
};
