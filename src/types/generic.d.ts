export type TAggregator =
  | 'all' | 'first' | 'last' | 'sum' | 'min' | 'max' | 'mean'
  | ( ( values: readonly T[ K ][] ) => R );

export type TObjOperator =
  | 'set' | 'inc' | 'max' | 'min' | 'append' | 'prepend'
  | ( ( curr: any, p: string ) => any );

export type TMeasuredResult< R > = {
  result: R;
  ms: number;
};
