import type { TListIndexItem, TListSnapshot } from '@rtbnext/schema/src/model/list';

import type { ISnapshot } from '@/interfaces/snapshot';
import type { TListSnapshotData } from '@/type/generic';


export interface IList extends ISnapshot< TListSnapshot > {
  getUri () : string;
  getItem () : TListIndexItem;
  saveSnapshot ( snapshot: TListSnapshotData, force: boolean = false ) : boolean;
}
