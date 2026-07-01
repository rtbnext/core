import type { TListIndexItem } from '@rtbnext/schema/src/model/list';


export type TListConfig< K extends string > = {
  uri: K;
  entry: ( date: string, count: number ) => TListIndexItem & { uri: K };
};

export type TListRegistry = { readonly [ K in string ]?: TListConfig< K > };
