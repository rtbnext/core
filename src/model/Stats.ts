import type { TChangeItem } from '@rtbnext/schema/src/base/assets';
import type { TStatsGroup as TStatsGroupType } from '@rtbnext/schema/src/base/const';
import type { TMetaData } from '@rtbnext/schema/src/base/generic';
import type {
  TAgePyramidGroup, TDBStats, TDBStatsData, TGlobalStats, TGlobalStatsData, THistory, THistoryItem, TProfileStats,
  TProfileStatsData, TScatter, TScatterData, TScatterItem, TStatsGroup, TWealthStats, TWealthStatsData
} from '@rtbnext/schema/src/model/stats';
import { join } from 'node:path';

import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import type { IStats } from '@/interface/stats';
import { Percentiles, StatsGroup, WealthSpread } from '@/lib/const';
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

  public setWealthStats ( data: TWealthStatsData ) : boolean {
    return this.saveStats( 'wealth.json', 'json', this.prepStats(
      Parser.container< TWealthStatsData >( {
        percentiles: { value: data.percentiles, type: 'obj', args: [ 'money' ] },
        quartiles: { value: data.quartiles, type: 'list', args: [ 'money' ] },
        total: { value: data.total, type: 'money' },
        max: { value: data.max, type: 'money' },
        min: { value: data.min, type: 'money' },
        mean: { value: data.mean, type: 'money' },
        median: { value: data.median, type: 'money' },
        stdDev: { value: data.stdDev, type: 'money' },
        decades: { value: data.decades, type: 'obj', args: [ 'money' ] },
        gender: { value: data.gender, type: 'obj', args: [ 'money' ] },
        spread: { value: data.spread, type: 'obj', args: [ 'number' ] }
      } )
    ) );
  }

  public setScatter ( data: TScatterData ) : boolean {
    return this.saveStats( 'scatter.json', 'json', this.prepStats( {
      count: Parser.number( data.count ), items: data.items
    } ) );
  }

  public setDBStats ( data: TDBStatsData ) : boolean {
    return this.saveStats( 'db.json', 'json', this.prepStats(
      Parser.container< TDBStatsData >( {
        files: { value: data.files, type: 'number' },
        size: { value: data.size, type: 'number' }
      } )
    ) );
  }

  // --- update history (add new line) ---

  public updateHistory ( data: Partial< TGlobalStats > ) : boolean {
    return log.catch(
      () => Stats.storage.datedCSV< THistoryItem >( this.resolvePath( 'history.csv' ), [
        Parser.date( data.date, 'ymd' )!, Parser.number( data.count ),
        Parser.money( data.total ), Parser.number( data.woman ), Parser.pct( data.quota ),
        Parser.money( data.today?.value ), Parser.pct( data.today?.percent )
      ], true ),
      `Failed to update history`
    ) ?? false;
  }

  // --- generate wealth stats ---

  public generateWealthStats ( scatter: TScatterItem[] ) : boolean {
    return log.catch( () => {
      log.debug( 'Generating wealth stats ...' );
      if ( ! scatter || ! scatter.length ) throw new Error( 'No scatter data provided' );
      scatter.sort( ( a, b ) => a.networth - b.networth );

      const count = scatter.length;
      const total = scatter.reduce( ( acc, i ) => acc + i.networth, 0 );
      const medianIndex = Math.floor( count / 2 );
      const median = count % 2 === 0 ? (
        scatter[ medianIndex - 1 ].networth + scatter[ medianIndex ].networth
      ) / 2 : scatter[ medianIndex ].networth;
      const mean = total / count;
      const variance = scatter.reduce( ( acc, i ) => {
        const diff = i.networth - mean; return acc + diff * diff;
      }, 0 ) / count;
      const stdDev = Math.sqrt( variance );

      const percentiles: TWealthStatsData[ 'percentiles' ] = {};
      Percentiles.forEach( p => {
        const idx = Math.ceil( ( parseInt( p ) / 100 ) * count ) - 1;
        percentiles[ p ] = scatter[ idx ].networth;
      } );

      const quartiles: TWealthStatsData[ 'quartiles' ] = [
        scatter[ Math.floor( count * 0.25 ) ].networth,
        scatter[ Math.floor( count * 0.5 ) ].networth,
        scatter[ Math.floor( count * 0.75 ) ].networth
      ];

      const decades: TWealthStatsData[ 'decades' ] = {};
      const gender: TWealthStatsData[ 'gender' ] = {};
      const spread: TWealthStatsData[ 'spread' ] = {};

      scatter.forEach( item => {
        const { gender: g, age, networth } = item;
        const decade = Math.max( 30, Math.min( 90, Math.floor( age / 10 ) * 10 ) );
        decades[ decade ] = ( decades[ decade ] || 0 ) + networth;
        gender[ g ] = ( gender[ g ] || 0 ) + networth;

        WealthSpread.forEach( n => {
          if ( networth >= Number( n ) * 1000 ) spread[ n ] = ( spread[ n ] || 0 ) + 1;
        } );
      } );

      return this.setWealthStats( {
        total, median, mean, stdDev, percentiles, quartiles, decades, gender, spread,
        max: scatter.at( -1 )!.networth, min: scatter[ 0 ].networth
      } )
    }, `Failed to generate wealth stats` ) ?? false;
  }
}
