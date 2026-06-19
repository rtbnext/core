import type { TSnapshot } from '@rtbnext/schema/src/base/generic';
import { join } from 'node:path';

import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import type { ISnapshot } from '@/interface/snapshot';
import type { TStorageRWType } from '@/type/storage';


export abstract class Snapshot< T extends TSnapshot > implements ISnapshot< T > {
  protected static readonly storage = Storage.getInstance();
  protected dates: string[];

  protected constructor (
    protected readonly path: string,
    protected readonly ext: TStorageRWType = 'json'
  ) {
    Snapshot.storage.ensurePath( this.path, true );
    this.dates = this.scanDates();
  }

  // --- helper ---

  protected scanDates () : string[] {
    return Utils.sort( Snapshot.storage.scanDir( this.path ) );
  }

  protected datedPath ( date: string ) : string {
    return join( this.path, `${ date }.${ this.ext }` );
  }
}
