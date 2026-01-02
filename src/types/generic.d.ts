export type TArgs = Record< string, string | boolean >;

export type TAggregator =
    | 'all' | 'first' | 'last' | 'sum' | 'min' | 'max' | 'mean'
    | ( ( values: readonly T[ K ][] ) => R );

export interface TMeasuredResult< R > {
    result: R;
    ms: number;
}
