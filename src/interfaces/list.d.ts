import type { TListIndexItem, TListSnapshot } from '@rtbnext/schema/src/model/list';

import type { ISnapshot } from '@/interfaces/snapshot';


export interface IList extends ISnapshot< TListSnapshot > {
  getUri () : string;
  getItem () : TListIndexItem;
  saveSnapshot ( snapshot: Omit< TListSnapshot, '$metadata' >, force: boolean = false ) : boolean;
}
