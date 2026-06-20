import type { TFilterCollection } from '@rtbnext/schema/src/model/filter';
import { join } from 'node:path';

import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import type { IFilter } from '@/interface/filter';
import { FilterGroup } from '@/lib/const';


export class Filter implements IFilter {
  private static readonly storage = Storage.getInstance();
  private static instance: IFilter;

  private data: Partial< TFilterCollection > = {};

  private constructor () {
    this.initDB();
  }

  private initDB () : void {
    log.debug( 'Initializing filter storage paths' );
    FilterGroup.forEach( group => Filter.storage.ensurePath( join( 'filter', group ), true ) );
  }
}
