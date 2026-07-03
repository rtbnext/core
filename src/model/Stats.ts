import type { TChangeItem } from '@rtbnext/schema/src/base/assets';
import type { TStatsGroup as TStatsGroupType } from '@rtbnext/schema/src/base/const';
import type { TMetaData } from '@rtbnext/schema/src/base/generic';
import type { TListSnapshot, TPersonListItem } from '@rtbnext/schema/src/model/list';
import type { TProfileData } from '@rtbnext/schema/src/model/profile';
import type {
  TAgePyramidGroup, TDBStats, TDBStatsData, TGlobalStats, TGlobalStatsData, THistory,
  THistoryItem, TProfileStats, TProfileStatsData, TScatter, TScatterItem, TStatsGroup,
  TStatsGroupItem, TTop10, TTop10Data, TTop10List, TWealthStats, TWealthStatsData
} from '@rtbnext/schema/src/model/stats';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import type { IStats } from '@/interface/stats';
import { Percentile, StatsGroup, WealthSpread } from '@/lib/const';
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
      ( this.resolvePath( path ) ) ?? ( format === 'csv' ? [] : {} ) ) as T;
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

  public getTop10 () : TTop10 {
    return this.getStats< TTop10 >( 'top10.json', 'json' );
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

  public setScatter ( items: TScatterItem[] ) : boolean {
    return this.saveStats( 'scatter.json', 'json', this.prepStats( {
      count: Parser.number( items.length ), items
    } ) );
  }

  public setTop10 ( data: TTop10Data ) : boolean {
    return this.saveStats( 'top10.json', 'json', this.prepStats( { data } ) );
  }

  public updateTop10 ( key: string, list: TTop10List ) : boolean {
    return this.setTop10( { ...this.getTop10().entries, [ key ]: list } );
  }

  public setDBStats ( data: TDBStatsData ) : boolean {
    return this.saveStats( 'db.json', 'json', this.prepStats(
      Parser.container< TDBStatsData >( {
        files: { value: data.files, type: 'number' },
        size: { value: data.size, type: 'number' }
      } )
    ) );
  }

  // --- grouped stats setter ---

  public setGroupedStats< T extends string = string > (
    group: TStatsGroupType, raw: Record< T, TStatsGroupItem >
  ) : boolean {
    return log.catch( () => {
      const items = Object.fromEntries(
        Object.entries< TStatsGroupItem >( raw ).map( ( [ key, item ] ) => {
          item = { first: item.first, ...Parser.container( {
            date: { value: item.date, type: 'date', args: [ 'ymd' ] },
            count: { value: item.count, type: 'number' },
            total: { value: item.total, type: 'money' },
            woman: { value: item.woman, type: 'number' },
            quota: { value: item.quota, type: 'pct' },
            today: { value: Parser.container< TChangeItem >( {
              value: { value: item.today?.value, type: 'money' },
              percent: { value: item.today?.percent, type: 'pct' }
            } ), type: 'container' },
            ytd: { value: Parser.container< TChangeItem >( {
              value: { value: item.ytd?.value, type: 'money' },
              percent: { value: item.ytd?.percent, type: 'pct' }
            } ), type: 'container' }
          } ) } as TStatsGroupItem;

          Stats.storage.datedCSV< THistoryItem >(
            this.resolvePath( `${ group }/${ key }.csv` ), [
              item.date, item.count, item.total, item.woman, item.quota,
              item.today?.value ?? 0, item.today?.percent ?? 0
            ], true );

          return [ key, item ];
        } )
      ) as Record< T, TStatsGroupItem >;

      this.saveStats< TStatsGroup< T >[ 'index' ] >(
        `${ group }/index.json`, 'json', this.prepStats( { items } )
      );
    }, `Failed to set grouped stats for group ${ group }` ) ?? false;
  }

  // --- update history (add new line) ---

  public updateHistory ( data: Partial< TGlobalStats > ) : boolean {
    return log.catch(
      () => Stats.storage.datedCSV< THistoryItem >( this.resolvePath( 'history.csv' ), [
        Parser.date( data.date, 'ymd' )!, Parser.number( data.count ),
        Parser.money( data.total ), Parser.number( data.woman ), Parser.pct( data.quota ),
        Parser.money( data.today?.value ), Parser.pct( data.today?.percent )
      ], true ),
      'Failed to update history'
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
      Percentile.forEach( p => {
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
        decades[ decade ] = ( decades[ decade ] ?? 0 ) + networth;
        gender[ g ] = ( gender[ g ] ?? 0 ) + networth;

        WealthSpread.forEach( n => {
          if ( networth >= Number( n ) * 1000 ) spread[ n ] = ( spread[ n ] ?? 0 ) + 1;
        } );
      } );

      return this.setWealthStats( {
        total, median, mean, stdDev, percentiles, quartiles, decades, gender, spread,
        max: scatter.at( -1 )!.networth, min: scatter[ 0 ].networth
      } )
    }, 'Failed to generate wealth stats' ) ?? false;
  }

  // --- generate top 10 entry ---

  public generateTop10Entry ( snapshot: TListSnapshot< TPersonListItem > ) : boolean {
    return log.catch( () => {
      const [ year, month ] = snapshot.date.split( '-', 2 ).map( Number );
      const key = `${ year }-${ String( month ).padStart( 2, '0' ) }`;
      const prev = `${ month === 1 ? year - 1 : year }-${ String( month === 1 ? 12 : month - 1 ).padStart( 2, '0' ) }`;

      log.debug( `Generating top 10 entry for ${ key } ...` );
      const { entries = {} } = this.getTop10();
      const last = entries[ prev ];
      const top10: TTop10List = [];

      for ( const { uri, rank, networth } of snapshot.items.slice( 0, 10 ) ) {
        const prevItem = last?.find( i => i.uri === uri );

        top10.push( { uri, rank, networth, flag: ! last ? 'unknown'
          : prevItem ? rank < prevItem.rank ? 'up' : rank > prevItem.rank ? 'down' : 'unchanged'
          : Object.entries( entries ).some( ( [ k, l ] ) => k !== key && l.some( i => i.uri === uri ) ) ? 'returned'
          : 'new'
        } );
      }

      return this.updateTop10( key, top10 );
    }, 'Failed to generate top 10 entry' ) ?? false;
  }

  // --- generate DB stats ---

  public generateDBStats () : boolean {
    return log.catch( () => {
      log.debug( 'Generating DB stats ...' );
      const stats = { files: 0, size: 0 };

      const scan = ( path: string ) : void => {
        readdirSync( path, { recursive: true } ).forEach( p => {
          if ( p === '.' || p === '..' || typeof p !== 'string' ) return;
          const fullPath = join( path, p );
          const stat = Stats.storage.stat( fullPath );

          if ( stat ) stat.isDirectory() ? scan( fullPath ) : (
            stats.files++, stats.size += stat.size
          );
        } );
      };

      scan( Stats.storage.root );
      return this.setDBStats( stats );
    }, 'Failed to generate DB stats' ) ?? false;
  }

  // --- instantiate ---

  public static getInstance () : IStats {
    return Stats.instance ??= new Stats();
  }

  // --- aggregate stats data ---

  public static aggregate ( data: TProfileData, date: string, stats: any ) : void {
    return log.catch( () => {
      const { uri, info, realtime, realtime: { rank, networth } = {} } = data;
      const age = Parser.age( info.birthDate ), decade = Parser.ageDecade( info.birthDate );
      const item = { uri, name: info.name.shortName };

      const set = ( path: string, n: any ) : void => Utils.update( 'set', stats, path, n );
      const inc = ( path: string, n?: number ) : void => Utils.update( 'inc', stats, path, n );
      const max = ( path: string, n: number ) : void => Utils.update( 'max', stats, path, n );
      const min = ( path: string, n: number ) : void => Utils.update( 'min', stats, path, n );
      const srt = ( n: number ) => n >= 10 ? 'over-10' : n >= 5 ? '5-to-10' : n === 4
        ? 'four' : n === 3 ? 'three' : n === 2 ? 'two' : n === 1 ? 'one' : 'none';

      if ( info.gender ) inc( `profile.gender.${ info.gender }` );
      if ( info.maritalStatus ) inc( `profile.maritalStatus.${ info.maritalStatus }` );
      if ( info.selfMade?.rank ) inc( `profile.selfMade.${ info.selfMade.rank }` );
      if ( info.philanthropyScore ) inc( `profile.philanthropyScore.${ info.philanthropyScore }` );

      if ( info.gender && age && decade ) {
        inc( `profile.agePyramid.${ info.gender }.count` );
        inc( `profile.agePyramid.${ info.gender }.decades.${ decade }` );
        inc( `profile.agePyramid.${ info.gender }.total`, age );
        max( `profile.agePyramid.${ info.gender }.max`, age );
        min( `profile.agePyramid.${ info.gender }.min`, age );

        set( `profile.agePyramid.${ info.gender }.mean`, (
          stats.profile.agePyramid[ info.gender ].total /
          stats.profile.agePyramid[ info.gender ].count
        ) );
      }

      if ( info.children ) {
        inc( `profile.children.full.${ info.children }` );
        inc( `profile.children.short.${ srt( info.children ) }` );
      } else {
        inc( 'profile.children.short.none' );
      }

      if ( ! networth || ! rank || realtime?.date !== date ) return stats;
      if ( info.gender && age && networth ) ( stats.scatter ??= [] ).push( { ...item, gender: info.gender, age, networth } );

      let k: string;
      StatsGroup.forEach( key => {
        if ( key in info && info[ key ] && ( k = info[ key ] ) ) {
          set( `groups.${ key }.${ k }.date`, date );
          inc( `groups.${ key }.${ k }.count` );
          inc( `groups.${ key }.${ k }.total`, networth );
          inc( `groups.${ key }.${ k }.woman`, +( info.gender === 'f' ) );
          set( `groups.${ key }.${ k }.quota`, ( stats.groups[ key ][ k ].woman / stats.groups[ key ][ k ].count * 100 ) );

          inc( `groups.${ key }.${ k }.today.value`, realtime.today?.value ?? 0 );
          inc( `groups.${ key }.${ k }.today.percent`, realtime.today?.percent ?? 0 );
          inc( `groups.${ key }.${ k }.ytd.value`, realtime.ytd?.value ?? 0 );
          inc( `groups.${ key }.${ k }.ytd.percent`, realtime.ytd?.percent ?? 0 );

          if ( rank < ( stats?.groups?.[ key ]?.[ k ]?.first?.rank ?? Infinity ) ) set(
            `groups.${ key }.${ k }.first`, { ...item, rank, networth }
          );
        }
      } );
    }, 'Failed to aggregate stats data' );
  }
}
