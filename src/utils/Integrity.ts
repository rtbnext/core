import type { TProfileData, TProfileIndexItem, TProfileMetaData, TProfileStatus } from '@rtbnext/schema/src/model/profile';
import { join } from 'node:path';

import { log } from '@/core/Logger';
import { ProfileQueue } from '@/core/Queue';
import { Storage } from '@/core/Storage';
import { Gender, Industry, MaritalStatus } from '@/lib/const';
import { Profile } from '@/model/Profile';
import { ProfileIndex } from '@/model/ProfileIndex';

export class Integrity {
  private static readonly files = [ 'meta.json', 'profile.json', 'history.csv' ] as const;
  private static readonly storage = Storage.getInstance();
  private static readonly index = ProfileIndex.getInstance();
  private static readonly queue = ProfileQueue.getInstance();

  // --- integrity checks ---

  private static validateFiles ( uri: string, flags: string[] ) : void {
    for ( const file of this.files )
      if ( ! Integrity.storage.exists( join( 'profile', uri, file ) ) )
        flags.push( `missing-${ file }` );
  }

  private static validateData ( data: TProfileData, flags: string[] ) : void {
    if ( ! data.id ) flags.push( 'missing-id' );
    if ( ! data.uri ) flags.push( 'missing-uri' );

    if ( ! data.info?.name?.fullName ) flags.push( 'missing-name' );
    if ( ! Gender.includes( data.info?.gender ) ) flags.push( 'invalid-gender' );
    if ( data.info?.birthDate && Number.isNaN( new Date( data.info?.birthDate ) ) ) flags.push( 'invalid-birthDate' );
    if ( data.info?.maritalStatus && ! MaritalStatus.includes( data.info?.maritalStatus ) ) flags.push( 'invalid-maritalStatus' );
    if ( data.info?.children && Number.isNaN( data.info?.children ) ) flags.push( 'invalid-children' );

    if ( ! Industry.includes( data.info?.industry ) ) flags.push( 'invalid-industry' );
    if ( ! Array.isArray( data.info?.source ) ) flags.push( 'invalid-source' );

    if ( ! Array.isArray( data.related ) ) flags.push( 'invalid-related' );
    if ( ! Array.isArray( data.media ) ) flags.push( 'invalid-media' );
    if ( ! Array.isArray( data.assets ) ) flags.push( 'invalid-assets' );
    if ( ! Array.isArray( data.annual ) ) flags.push( 'invalid-annual' );
  }

  // --- check profile ---

  private static checkProfile ( item: TProfileIndexItem ) : boolean {
    const profile = Profile.getByItem( item ), flags: string[] = [];

    // --- check missing profile ---
    if ( ! profile ) flags.push( 'missing-profile' );

    // --- check missing files ---
    if ( profile ) this.validateFiles( item.uri, flags );

    // --- check invalid profile data ---
    if ( profile && ! flags.includes( 'missing-profile.json' ) )
      this.validateData( profile.getData(), flags );

    const status: TProfileStatus = {
      state: flags.includes( 'missing-profile' ) ? 'missing' : flags.length ? 'invalid' : 'healthy',
      flags
    };

    if ( status.state !== 'healthy' ) {
      log.warn( `Invalid profile: ${ item.uri } (${ flags.join( ', ' ) })` );
      this.queue.add( { uriLike: item.uri, prio: 10 } );
    }

    if ( profile ) Integrity.storage.writeJSON< TProfileMetaData >(
      join( 'profile', item.uri, 'meta.json' ),
      { $metadata: { ...profile.getMeta(), status } }
    );

    return status.state === 'healthy';
  }

  // --- run integrity check ---

  public static run () : void {
    log.info( 'Run profile integrity check ...' );
    let checked = 0, invalid = 0;

    for ( const item of this.index.values )
      checked++, invalid += +! this.checkProfile( item );

    log.info( `Integrity check completed: ${ checked } checked, ${ invalid } invalid` );
  }
}
