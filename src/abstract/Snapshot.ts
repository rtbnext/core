import type { TSnapshot } from '@rtbnext/schema/src/base/generic';

import { Storage } from '@/core/Storage';
import type { ISnapshot } from '@/interface/snapshot';


export abstract class Snapshot< T extends TSnapshot > implements ISnapshot< T > {
  protected static readonly storage = Storage.getInstance();
  protected dates: string[];
}
