import type { TProfileData, TProfileIndexItem, TProfileStatus } from '@rtbnext/schema/src/model/profile';
import { join } from 'node:path';

import { log } from '@/core/Logger';
import { ProfileQueue } from '@/core/Queue';
import { Storage } from '@/core/Storage';
import type { IProfile } from '@/interface/profile';
import { Gender, Industry, MaritalStatus } from '@/lib/const';
import { Profile } from '@/model/Profile';
import { ProfileIndex } from '@/model/ProfileIndex';
import { Parser } from '@/parser/Parser';
import type { TIntegrityCheck, TValidateState } from '@/type/integrity';


export class Integrity {
  private static readonly files = [ 'profile.json', 'history.csv' ] as const;
  private static readonly storage = Storage.getInstance();
  private static readonly index = ProfileIndex.getInstance();
  private static readonly queue = ProfileQueue.getInstance();

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
    Integrity.validate( state, [
      [ !! data.id, 'missing-id', 150, true ],
      [ !! data.uri, 'missing-uri', 150, true ],

      [ !! data.info?.name?.fullName, 'missing-name', 50, true ],
      [ Gender.includes( data.info?.gender ), 'invalid-gender', 25, true ],
      [ ! data.info?.birthDate || ! Number.isNaN( new Date( data.info.birthDate ).getTime() ), 'invalid-birthDate', 25, true ],
      [ ! data.info?.maritalStatus || MaritalStatus.includes( data.info.maritalStatus ), 'invalid-maritalStatus', 25, true ],
      [ data.info?.children == null || ! Number.isNaN( data.info.children ), 'invalid-children', 25, true ],

      [ Industry.includes( data.info?.industry ), 'invalid-industry', 50, true ],
      [ Array.isArray( data.info?.source ), 'invalid-source', 25, true ],

      [ Array.isArray( data.related ), 'invalid-related', 20, true ],
      [ Array.isArray( data.media ), 'invalid-media', 20, true ],
      [ Array.isArray( data.assets ), 'invalid-assets', 20, true ],
      [ Array.isArray( data.annual ), 'invalid-annual', 20, true ],

      [ !! data.info?.name?.lastName, 'missing-lastName', 10, false ],
      [ !! data.info?.birthPlace, 'missing-birthPlace', 5, false ],
      [ !! data.info?.citizenship, 'missing-citizenship', 5, false ],
      [ !! data.info?.residence, 'missing-residence', 5, false ],

      [ !! data.realtime?.networth, 'missing-networth', 5, false ],
      [ !! data.realtime?.rank, 'missing-rank', 5, false ],
      [ data.realtime?.networth == null || data.realtime.networth >= 0, 'invalid-networth', 20, true ],
      [ data.ranking?.length > 0, 'missing-ranking', 5, false ],

      [ data.bio?.cv?.length > 0, 'missing-cv', 10, false ],
      [ data.bio?.facts?.length > 0, 'missing-facts', 5, false ],

      [ data.media?.length > 0, 'missing-profile-image', 10, false ],

      [ !! data.wiki, 'missing-wiki', 5, false ],
      [ !! data.wiki?.wikidata, 'missing-wikidata', 5, false ]
    ] );
  }

  // --- calculate score ---

  private static calculateScore ( penalty: number ) : number {
    return Parser.clamp( Math.sqrt( Parser.clamp( 1 - penalty / 150, [ 0, 1 ], 6 ) ) * 100, [ 0, 100 ], 3 );
  }

  // --- check profile ---

  private static finish ( item: TProfileIndexItem, profile: IProfile | undefined, state: TValidateState, enqueue: boolean ) : boolean {
    const { flags, invalid, penalty } = state, score = Integrity.calculateScore( penalty );
    const status: TProfileStatus = { status: ! profile ? 'missing' : invalid ? 'invalid' : 'healthy', score, flags };

    if ( invalid ) log.warn( `Invalid profile: ${ item.uri } (${ flags.join( ', ' ) }; score: ${ score }%)` );
    if ( enqueue ) Integrity.queue.add( { uriLike: item.uri, prio: 10 } );

    if ( profile ) profile.saveStatus( status );
    return ! invalid;
  }

  private static checkProfile ( item: TProfileIndexItem ) : boolean {
    const profile = Profile.getByItem( item );

    // --- missing profile ---
    if ( ! profile ) return Integrity.finish( item, undefined, { flags: [ 'missing-profile' ], invalid: true, penalty: 200 }, true );

    // --- missing files ---
    const state: TValidateState = { flags: [], invalid: false, penalty: 0 };
    Integrity.validateFiles( item.uri, state );

    // --- missing or invalid data ---
    const missingProfile = state.flags.includes( 'missing-profile.json' );
    if ( ! missingProfile ) Integrity.validateData( profile.getData(), state );

    return Integrity.finish( item, profile, state, missingProfile );
  }

  // --- run integrity check ---

  public static run () : void {
    log.info( 'Run profile integrity check ...' );

    let checked = 0, invalid = 0;
    for ( const item of Integrity.index.values ) checked++, invalid += +! Integrity.checkProfile( item );

    log.info( `Integrity check completed: ${ checked } checked, ${ invalid } invalid` );
  }
}
