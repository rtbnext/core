import type { TIndex } from '@rtbnext/schema/src/base/generic';

import { Storage } from '@/core/Storage';
import type { IIndex } from '../interfaces';


export abstract class Index< I extends TIndex, T extends Map< string, I > > implements IIndex< I, T > {
  protected static readonly storage = Storage.getInstance();
  protected readonly type: 'profile' | 'list';
  protected readonly path: string;
  protected index: T;

  protected constructor ( type: 'profile' | 'list', path: string ) {
    this.type = type;
    this.path = path;
    Index.storage.ensurePath( this.path );
  }
}
