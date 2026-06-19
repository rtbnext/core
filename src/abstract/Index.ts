import type { TIndex } from '@rtbnext/schema/src/base/generic';

import { Storage } from '@/core/Storage';
import type { IIndex } from '../interfaces';


export abstract class Index< I extends TIndex, T extends Map< string, I > > implements IIndex< I, T > {
  protected static readonly storage = Storage.getInstance();
}
