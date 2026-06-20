import { join } from 'node:path';

import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import type { IStats } from '@/interface/stats';
import { StatsGroup } from '@/lib/const';


export class Stats implements IStats {
  private static readonly storage = Storage.getInstance();
  private static instance: IStats;

  private constructor () {
    this.initDB();
  }

  private initDB () : void {
    log.debug( 'Initializing stats storage paths' );
    StatsGroup.forEach( group => Stats.storage.ensurePath( this.resolvePath( group ), true ) );
  }

  // --- helper ---

  private resolvePath ( path: string ) : string {
    return join( 'stats', path );
  }
}
