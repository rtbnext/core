import type { TProfileData, TProfileIndexItem } from '@rtbnext/schema/src/model/profile';
import { join } from 'node:path';

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

  private static checkProfile ( item: TProfileIndexItem ) : void {
    const profile = Profile.getByItem( item ), flags: string[] = [];

    // --- check missing profile ---
    if ( ! profile ) flags.push( 'missing-profile' );

    // --- check missing files ---
    if ( profile ) this.validateFiles( item.uri, flags );

    // --- check invalid profile data ---
    if ( profile && ! flags.includes( 'missing-profile.json' ) )
      this.validateData( profile.getData(), flags );

    //
  }
}
