import type { TSearchIndexItem } from '@rtbnext/schema/src/model/search';


export interface ISearch {
  getIndex () : TSearchIndexItem[];
  readonly size: number;
  filter ( predicate: ( item: TSearchIndexItem ) => boolean ) : TSearchIndexItem[];
  save ( items?: TSearchIndexItem[] ) : void;
}
