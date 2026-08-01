import type { TProfileData, TProfileIndexItem, TProfileStatus } from '@rtbnext/schema/src/model/profile';
import countries from 'i18n-iso-countries';
import { join } from 'node:path';

import { log } from '@/core/Logger';
import { ProfileQueue } from '@/core/Queue';
import { Storage } from '@/core/Storage';
import type { IProfile } from '@/interface/profile';
import { Gender, Industry, MaritalStatus } from '@/lib/const';
import { Profile } from '@/model/Profile';
import { ProfileIndex } from '@/model/ProfileIndex';
import { Parser } from '@/parser/Parser';
import type { TIntegrityCheck, TIntegrityReport, TIntegrityReportFlags, TIntegrityReportItem, TValidateState } from '@/type/integrity';


export class Integrity {
  private static readonly files = [ 'profile.json', 'history.csv' ] as const;
  private static readonly storage = Storage.getInstance();
  private static readonly index = ProfileIndex.getInstance();
  private static readonly queue = ProfileQueue.getInstance();

  // --- validation helper ---

  private static _isValid ( value: unknown, cb: ( value: any ) => boolean ) : boolean {
    return value === undefined || value === null ? true : cb( value );
  }

  private static _inRange ( value: number | string | undefined, range: [ number, number ] ) : boolean {
    const n = Number( value );
    return value !== undefined && ! Number.isNaN( n ) && n >= range[ 0 ] && n <= range[ 1 ];
  }

  private static _isArr ( value: unknown, minLen: number = 1 ) : boolean {
    return Array.isArray( value ) && value.length >= minLen;
  }

  private static _hasItem ( value: unknown, arr: unknown[] ) : boolean {
    return value !== undefined && arr.includes( value );
  }

  // --- validation ---

  private static validate ( state: TValidateState, checks: TIntegrityCheck ) : void {
    for ( const [ ok, flag, penalty, invalid ] of checks ) if ( ! ok ) {
      state.flags.push( flag );
      state.invalid = state.invalid || invalid;
      state.penalty += penalty;
    }
  }

  private static validateFiles ( uri: string, state: TValidateState ) : void {
    Integrity.validate( state, Integrity.files.map( file => [
      Integrity.storage.exists( join( 'profile', uri, file ) ),
      `missing-${ file }`, 200, true
    ] as const ) );
  }

  private static validateData ( data: TProfileData, state: TValidateState ) : void {
    const { info, bio } = data;

    Integrity.validate( state, [
      // --- identity ---
      [ !! data.id, 'missing-id', 150, true ],
      [ !! data.uri, 'missing-uri', 150, true ],

      // --- personal information ---
      [ !! info?.name?.fullName, 'missing-name', 50, true ],
      [ !! info?.name?.lastName, 'missing-lastName', 10, false ],

      [ this._hasItem( info?.gender, Gender ), 'invalid-gender', 25, true ],
      [ this._isValid( info?.birthDate, v => ! Number.isNaN( v = Parser.age( v ) ) && this._inRange( v, [ 15, 155 ] ) ), 'invalid-birthDate', 25, true ],
      [ this._isValid( info?.maritalStatus, v => this._hasItem( v, MaritalStatus ) ), 'invalid-maritalStatus', 25, true ],
      [ this._isValid( info?.children, v => this._inRange( v, [ 0, 25 ] ) ), 'invalid-children', 25, true ],

      [ !! info?.birthPlace, 'missing-birthPlace', 5, false ],
      [ !! info?.citizenship, 'missing-citizenship', 5, false ],
      [ this._isValid( info?.citizenship, v => !! countries.getName( v, 'en' ) ), 'invalid-citizenship', 20, false ],
      [ !! info?.residence, 'missing-residence', 5, false ],

      // --- profile metadata ---
      [ this._hasItem( info?.industry, Industry ), 'invalid-industry', 50, true ],
      [ Array.isArray( info?.source ), 'invalid-source', 25, true ],
      [ this._isValid( info?.source, v => this._isArr( v ) ), 'missing-source', 10, false ],

      [ !! info?.selfMade, 'missing-selfMade', 10, false ],
      [ this._isValid( info?.selfMade?.rank, v => this._inRange( v, [ 1, 10 ] ) ), 'invalid-selfMade', 20, false ],
      [ this._isValid( info?.philanthropyScore, v => this._inRange( v, [ 1, 5 ] ) ), 'invalid-philanthropyScore', 10, false ],

      // --- realtime data ---
      [ !! data.realtime?.networth, 'missing-networth', 0, false ],
      [ !! data.realtime?.rank, 'missing-rank', 0, false ],
      [ data.realtime?.networth == null || data.realtime.networth >= 0, 'invalid-networth', 20, true ],
      [ data.ranking?.length > 0, 'missing-ranking', 0, false ],

      // --- content ---
      [ Array.isArray( data.related ), 'invalid-related', 20, true ],
      [ Array.isArray( data.media ), 'invalid-media', 20, true ],
      [ Array.isArray( data.assets ), 'invalid-assets', 20, true ],
      [ Array.isArray( data.annual ), 'invalid-annual', 20, true ],

      [ this._isArr( bio?.cv ), 'missing-cv', 10, false ],
      [ this._isArr( bio?.facts ), 'missing-facts', 5, false ],
      [ this._isArr( data.media ), 'missing-profile-image', 10, false ],

      // --- external links ---
      [ !! data.wiki, 'missing-wiki', 5, false ],
      [ !! data.wiki?.wikidata, 'missing-wikidata', 5, false ]
    ] );
  }

  // --- calculate score ---

  private static calculateScore ( penalty: number ) : number {
    return Parser.clamp( Math.sqrt( Parser.clamp( 1 - penalty / 150, [ 0, 1 ], 6 ) ) * 100, [ 0, 100 ], 3 );
  }

  // --- check profile ---

  private static finish ( item: TProfileIndexItem, profile: IProfile | undefined, state: TValidateState, enqueue: boolean ) : TProfileStatus {
    const { flags, invalid, penalty } = state, score = Integrity.calculateScore( penalty );
    const status: TProfileStatus = { status: ! profile ? 'missing' : invalid ? 'invalid' : 'healthy', score, flags };

    if ( invalid ) log.warn( `Invalid profile: ${ item.uri } (${ flags.join( ', ' ) }; score: ${ score }%)` );
    if ( enqueue ) Integrity.queue.add( { uriLike: item.uri, prio: 10 } );

    if ( profile ) profile.saveStatus( status );
    return status;
  }

  private static checkProfile ( item: TProfileIndexItem ) : TProfileStatus {
    return log.catch( () => {
      const profile = Profile.getByItem( item );

      // --- missing profile ---
      if ( ! profile ) return Integrity.finish( item, undefined, {
        flags: [ 'missing-profile' ], invalid: true, penalty: 200
      }, true );

      // --- missing files ---
      const state: TValidateState = { flags: [], invalid: false, penalty: 0 };
      Integrity.validateFiles( item.uri, state );

      // --- missing or invalid data ---
      const missingProfile = state.flags.includes( 'missing-profile.json' );
      if ( ! missingProfile ) Integrity.validateData( profile.getData(), state );

      return Integrity.finish( item, profile, state, missingProfile );
    }, `Failed to check profile: ${ item.uri }` ) ?? { status: 'unknown', score: 0 };
  }

  // --- save report ---

  private static saveReport ( report: TIntegrityReport ) : void {
    Integrity.storage.writeJSON< TIntegrityReport >( 'system/integrity.json', report );
  }

  // --- run integrity check ---

  public static run ( saveReport: boolean = true ) : TIntegrityReport {
    log.info( 'Run profile integrity check ...' );

    const items: TIntegrityReportItem[] = [], flags: TIntegrityReportFlags = {};
    let total = 0, affected = 0, score = 0;

    for ( const item of Integrity.index.values ) {
      const res = Integrity.checkProfile( item );

      if ( res.status !== 'healthy' ) affected++;
      if ( res.flags?.length ) items.push( { uri: item.uri, ...res } );

      flags[ res.status ] = ( flags[ res.status ] ??= 0 ) + 1;
      total++, score+= res.score;
    };

    items.sort( ( a, b ) => a.score - b.score );
    const report: TIntegrityReport = { generatedAt: new Date().toISOString(), items, stats: {
      total, affected, flags, avgScore: total ? Parser.number( score / total, 3 ) : 0
    } };

    log.info( `Integrity check completed: ${ total } checked, ${ affected } affected` );

    if ( saveReport ) Integrity.saveReport( report );
    return report;
  }
}
