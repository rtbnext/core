import type { TChangeItem } from '@rtbnext/schema/src/base/assets';
import type { TStatsGroup as TStatsGroupType } from '@rtbnext/schema/src/base/const';
import type { TMetaData } from '@rtbnext/schema/src/base/generic';
import type {
  TAgePyramidGroup, TDBStats, TGlobalStats, TGlobalStatsData, THistory, TProfileStats,
  TProfileStatsData, TScatter, TStatsGroup, TWealthStats
} from '@rtbnext/schema/src/model/stats';
import { join } from 'node:path';

import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import type { IStats } from '@/interface/stats';
import { StatsGroup } from '@/lib/const';
import { Parser } from '@/parser/Parser';


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

  // --- grouped stats getter ---

  public getGroupedStatsIndex ( group: TStatsGroupType ) : TStatsGroup< string >[ 'index' ] {
    return this.getStats< TStatsGroup< string >[ 'index' ] >( `${ group }/index.json`, 'json' );
  }

  public getGroupedStatsHistory ( group: TStatsGroupType, key: string ) : THistory {
    return this.getStats< THistory >( `${ group }/${ key }.csv`, 'csv' );
  }

  public getGroupedStats ( group: TStatsGroupType ) : TStatsGroup< string > {
    const index = this.getGroupedStatsIndex( group );
    const history = Object.fromEntries( Object.keys( index.items ).map(
      k => [ k, this.getGroupedStatsHistory( group, k ) ]
    ) );

    return { index, history };
  }

  // --- setter ---

  public setGlobalStats ( data: TGlobalStatsData ) : boolean {
    return this.saveStats( 'global.json', 'json', this.prepStats(
      Parser.container< TGlobalStatsData >( {
        date: { value: data.date, type: 'date', args: [ 'ymd' ] },
        count: { value: data.count, type: 'number' },
        total: { value: data.total, type: 'money' },
        woman: { value: data.woman, type: 'number' },
        quota: { value: data.quota, type: 'pct' },
        today: { value: Parser.container< TChangeItem >( {
          value: { value: data.today?.value, type: 'money' },
          percent: { value: data.today?.percent, type: 'pct' }
        } ), type: 'container' },
        ytd: { value: Parser.container< TChangeItem >( {
          value: { value: data.ytd?.value, type: 'money' },
          percent: { value: data.ytd?.percent, type: 'pct' }
        } ), type: 'container' },
        stats: { value: Parser.container< TGlobalStatsData[ 'stats' ] >( {
          profiles: { value: data.stats?.profiles, type: 'number' },
          days: { value: data.stats?.days, type: 'number' }
        } ), type: 'container' }
      } )
    ) );
  }

  public setProfileStats ( data: TProfileStatsData ) : boolean {
    return this.saveStats( 'profile.json', 'json', this.prepStats( {
      ...Parser.container< Partial< TProfileStatsData > >( {
        gender: { value: data.gender, type: 'obj', args: [ 'number' ] },
        maritalStatus: { value: data.maritalStatus, type: 'obj', args: [ 'number' ] },
        children: { value: Parser.container< TProfileStatsData[ 'children' ] >( {
          full: { value: data.children?.full, type: 'obj', args: [ 'number' ] },
          short: { value: data.children?.short, type: 'obj', args: [ 'number' ] },
        } ), type: 'container' },
        selfMade: { value: data.selfMade, type: 'obj', args: [ 'number' ] },
        philanthropyScore: { value: data.philanthropyScore, type: 'obj', args: [ 'number' ] }
      } ),
      agePyramid: Object.fromEntries( Object.entries( data.agePyramid ).map(
        ( [ gender, item ] ) => [ gender, Parser.container< TAgePyramidGroup >( {
          count: { value: item.count, type: 'number' },
          decades: { value: item.decades, type: 'obj', args: [ 'number' ] },
          max: { value: item.max, type: 'number' },
          min: { value: item.min, type: 'number' },
          mean: { value: item.mean, type: 'number' }
        } ) ]
      ) )
    } ) );
  }
}
