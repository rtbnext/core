import type { TMetaData } from '@rtbnext/schema/src/base/generic';
import type { TDBStats, TGlobalStats, THistory, TProfileStats, TScatter, TWealthStats } from '@rtbnext/schema/src/model/stats';
import { join } from 'node:path';

import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
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

  private prepStats < T > ( data: T ) : T & TMetaData {
    return { ...Utils.metaData(), ...data };
  }

  private getStats < T > ( path: string, format: 'json' | 'csv' ) : T {
    return ( ( Stats.storage[ format === 'csv' ? 'readCSV' : 'readJSON' ] as any )
      ( this.resolvePath( path ) ) || ( format === 'csv' ? [] : {} ) ) as T;
  }

  private saveStats < T > ( path: string, format: 'json' | 'csv', data: T ) : boolean {
    return log.catch( () =>
      ( Stats.storage[ format === 'csv' ? 'writeCSV' : 'writeJSON' ] as any )
        ( this.resolvePath( path ), data ), `Failed to save stats to ${ path }`
    ) ?? false;
  }

  // --- getter ---

  public getGlobalStats () : TGlobalStats {
    return this.getStats< TGlobalStats >( 'global.json', 'json' );
  }

  public getProfileStats () : TProfileStats {
    return this.getStats< TProfileStats >( 'profile.json', 'json' );
  }

  public getWealthStats () : TWealthStats {
    return this.getStats< TWealthStats >( 'wealth.json', 'json' );
  }

  public getScatter () : TScatter {
    return this.getStats< TScatter >( 'scatter.json', 'json' );
  }

  public getDBStats () : TDBStats {
    return this.getStats< TDBStats >( 'db.json', 'json' );
  }

  public getHistory () : THistory {
    return this.getStats< THistory >( 'history.csv', 'csv' );
  }
}
