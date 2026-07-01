import type { TListSnapshot } from '@rtbnext/schema/src/model/list';

import type { ISnapshot } from '@/interface/snapshot';
import type { TListSnapshotData } from '@/type/generic';


export interface IList extends ISnapshot< TListSnapshot > {
  getUri () : string;
  saveSnapshot ( snapshot: TListSnapshotData, force: boolean = false ) : boolean;
}
