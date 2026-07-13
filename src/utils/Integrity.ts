import type { TProfileStatusFlag } from '@rtbnext/schema/src/base/const';
import type { TProfileData, TProfileIndexItem } from '@rtbnext/schema/src/model/profile';
import { join } from 'node:path';

import { ProfileQueue } from '@/core/Queue';
import { Storage } from '@/core/Storage';
import { Profile } from '@/model/Profile';
import { ProfileIndex } from '@/model/ProfileIndex';


export class Integrity {
  private static readonly files = [ 'meta.json', 'profile.json', 'history.csv' ] as const;
  private static readonly storage = Storage.getInstance();
  private static readonly index = ProfileIndex.getInstance();
  private static readonly queue = ProfileQueue.getInstance();

  private static checkProfile ( item: TProfileIndexItem ) : { status: TProfileStatusFlag, flags: string[] } {
    const flags: string[] = [], profile = Profile.getByItem( item );

    // --- profile is missing ---
    if ( ! profile ) return { status: 'missing', flags: [ 'missing-profile' ] };

    // --- check missing files ---
    for ( const file of this.files )
      if ( ! Integrity.storage.exists( join( 'profile', item.uri, file ) ) )
        flags.push( `missing-${ file }` );

    // --- check invalide data ---
    if ( ! flags.includes( 'missing-profile.json' ) )
      this.validateData( profile.getData(), flags );

    return { status: flags.length ? 'invalid' : 'healthy', flags };
  }

  private static validateData ( data: TProfileData, flags: string[] ) : void {
    if ( ! data.id ) flags.push( 'missing-id' );
    if ( ! data.uri ) flags.push( 'missing-uri' );
    if ( ! data.info?.name?.fullName ) flags.push( 'missing-name' );
    if ( ! Array.isArray( data.related ) ) flags.push( 'invalid-related' );
    if ( ! Array.isArray( data.media ) ) flags.push( 'invalid-media' );
    if ( ! Array.isArray( data.assets ) ) flags.push( 'invalid-assets' );
    if ( ! Array.isArray( data.annual ) ) flags.push( 'invalid-annual' );
  }

  public static run () : void {}
}
