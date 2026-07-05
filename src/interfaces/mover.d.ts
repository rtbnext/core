import type { TMover } from '@rtbnext/schema/src/model/mover';

import type { ISnapshot } from '@/interface/snapshot';


export interface IMover extends ISnapshot< TMover > {
  saveSnapshot ( snapshot: TMoverData, force?: boolean ) : boolean;
}
