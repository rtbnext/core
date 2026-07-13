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

  // --- validation ---

  private static validate ( flags: string[], checks: readonly ( readonly [ unknown, string ] )[] ) : void {
    for ( const [ ok, flag ] of checks ) if ( ! ok ) flags.push( flag );
  }

  private static validateFiles ( uri: string, flags: string[] ) : void {
    this.validate( flags, this.files.map( file => [
      this.storage.exists( join( 'profile', uri, file ) ),
      `missing-${ file }`
    ] as const ) );
  }

  private static validateData ( data: TProfileData, flags: string[] ) : void {
    this.validate( flags, [
      [ data.id, 'missing-id' ],
      [ data.uri, 'missing-uri' ],

      [ data.info?.name?.fullName, 'missing-name' ],
      [ Gender.includes( data.info?.gender ), 'invalid-gender' ],
      [ ! data.info?.birthDate || !Number.isNaN( new Date( data.info.birthDate ).getTime() ), 'invalid-birthDate' ],
      [ ! data.info?.maritalStatus || MaritalStatus.includes( data.info.maritalStatus ), 'invalid-maritalStatus' ],
      [ data.info?.children == null || !Number.isNaN( data.info.children ), 'invalid-children' ],

      [ Industry.includes( data.info?.industry ), 'invalid-industry' ],
      [ Array.isArray( data.info?.source ), 'invalid-source' ],

      [ Array.isArray( data.related ), 'invalid-related' ],
      [ Array.isArray( data.media ), 'invalid-media' ],
      [ Array.isArray( data.assets ), 'invalid-assets' ],
      [ Array.isArray( data.annual ), 'invalid-annual' ]
    ] );
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
