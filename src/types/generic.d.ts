import type { TIndustry, TMaritalStatus } from '@rtbnext/schema/src/base/const';
import type { TListSnapshot } from '@rtbnext/schema/src/model/list';


export type TArgs = Record< string, string | boolean >;

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

export type TMaritalStatusResolver = Record< string, TMaritalStatus >;
export type TIndustryResolver = Record< string, TIndustry >;

export type TListSnapshotData = Omit< TListSnapshot, '$metadata' >;
