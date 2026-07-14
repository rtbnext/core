import type { TProfileData, TProfileIndexItem, TProfileStatus } from '@rtbnext/schema/src/model/profile';
import { join } from 'node:path';

import { log } from '@/core/Logger';
import { ProfileQueue } from '@/core/Queue';
import { Storage } from '@/core/Storage';
import type { IProfile } from '@/interface/profile';
import { Gender, Industry, MaritalStatus } from '@/lib/const';
import { Profile } from '@/model/Profile';
import { ProfileIndex } from '@/model/ProfileIndex';
import type { TValidateState } from '@/type/integrity';


export class Integrity {
  private static readonly files = [ 'profile.json', 'history.csv' ] as const;
  private static readonly storage = Storage.getInstance();
  private static readonly index = ProfileIndex.getInstance();
  private static readonly queue = ProfileQueue.getInstance();

  // --- validation ---

  private static validate ( state: TValidateState, checks: readonly ( readonly [ unknown, string, number ] )[] ) : void {
    for ( const [ ok, flag, p ] of checks ) if ( ! ok ) state.penalty += p, state.flags.push( flag );
  }

  private static validateFiles ( uri: string, state: TValidateState ) : void {
    Integrity.validate( state, Integrity.files.map( file => [
      Integrity.storage.exists( join( 'profile', uri, file ) ),
      `missing-${ file }`, 200
    ] as const ) );
  }

  private static validateData ( data: TProfileData, state: TValidateState ) : void {
    Integrity.validate( state, [
      [ !! data.id, 'missing-id', 150 ],
      [ !! data.uri, 'missing-uri', 150 ],

      [ !! data.info?.name?.fullName, 'missing-name', 25 ],
      [ Gender.includes( data.info?.gender ), 'invalid-gender', 25 ],
      [ ! data.info?.birthDate || ! Number.isNaN( new Date( data.info.birthDate ).getTime() ), 'invalid-birthDate', 25 ],
      [ ! data.info?.maritalStatus || MaritalStatus.includes( data.info.maritalStatus ), 'invalid-maritalStatus', 25 ],
      [ data.info?.children == null || ! Number.isNaN( data.info.children ), 'invalid-children', 25 ],

      [ Industry.includes( data.info?.industry ), 'invalid-industry', 50 ],
      [ Array.isArray( data.info?.source ), 'invalid-source', 25 ],

      [ Array.isArray( data.related ), 'invalid-related', 20 ],
      [ Array.isArray( data.media ), 'invalid-media', 20 ],
      [ Array.isArray( data.assets ), 'invalid-assets', 20 ],
      [ Array.isArray( data.annual ), 'invalid-annual', 20 ],

      [ !! data.info?.name?.lastName, 'missing-lastName', 10 ],
      [ !! data.info?.birthPlace, 'missing-birthPlace', 5 ],
      [ !! data.info?.citizenship, 'missing-citizenship', 5 ],
      [ !! data.info?.residence, 'missing-residence', 5 ],

      [ !! data.realtime?.networth, 'missing-networth', 5 ],
      [ !! data.realtime?.rank, 'missing-rank', 5 ],
      [ data.realtime?.networth == null || data.realtime.networth >= 0, 'invalid-networth', 20 ],
      [ data.ranking.length > 0, 'missing-ranking', 5 ],

      [ data.bio?.cv.length > 0, 'missing-cv', 10 ],
      [ data.bio?.facts.length > 0, 'missing-facts', 5 ],

      [ data.media.length > 0, 'missing-profile-image', 10 ],

      [ !! data.wiki, 'missing-wiki', 5 ],
      [ !! data.wiki?.wikidata, 'missing-wikidata', 5 ]
    ] );
  }

  // --- check profile ---

  private static finish ( item: TProfileIndexItem, profile: IProfile | undefined, flags: string[], enqueue: boolean ) : boolean {
    const healthy = flags.length === 0;
    const status: TProfileStatus = { status: ! profile ? 'missing' : healthy ? 'healthy' : 'invalid', flags };

    if ( ! healthy ) log.warn( `Invalid profile: ${ item.uri } (${ flags.join( ', ' ) })` );
    if ( enqueue ) Integrity.queue.add( { uriLike: item.uri, prio: 10 } );

    if ( profile ) profile.saveStatus( status );
    return healthy;
  }

  private static checkProfile ( item: TProfileIndexItem ) : boolean {
    const profile = Profile.getByItem( item ), flags: string[] = [];

    // --- missing profile ---
    if ( ! profile ) return Integrity.finish( item, undefined, [ 'missing-profile' ], true );

    // --- missing files ---
    Integrity.validateFiles( item.uri, flags );

    // --- missing or invalid data ---
    const missingProfile = flags.includes( 'missing-profile.json' );
    if ( ! missingProfile ) Integrity.validateData( profile.getData(), flags );

    return Integrity.finish( item, profile, flags, missingProfile );
  }

  // --- run integrity check ---

  public static run () : void {
    log.info( 'Run profile integrity check ...' );

    let checked = 0, invalid = 0;
    for ( const item of Integrity.index.values ) checked++, invalid += +! Integrity.checkProfile( item );

    log.info( `Integrity check completed: ${ checked } checked, ${ invalid } invalid` );
  }
}
