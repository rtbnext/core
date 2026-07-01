import type { IListParser } from '@/interface/parser';
import type { TListIndexItem } from '@rtbnext/schema/src/model/list';


export type TListConfig< K extends string > = {
  uri: K;
  parser ( raw: object ) : IListParser;
  entry: TListIndexItem & { uri: K };
};

export type TListRegistry = { readonly [ K in string ]?: TListConfig< K > };
