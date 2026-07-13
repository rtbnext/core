import { ProfileQueue } from '@/core/Queue';
import { ProfileIndex } from '@/model/ProfileIndex';
import { TProfileData } from '@rtbnext/schema/src/model/profile';

export class Integrity {
  private static readonly files = [ 'meta.json', 'profile.json', 'history.csv' ] as const;
  private static readonly index = ProfileIndex.getInstance();
  private static readonly queue = ProfileQueue.getInstance();

  private static validateData ( data: TProfileData, errors: string[] ) : void {
    if ( ! data.id ) errors.push( 'missing-id' );
    if ( ! data.uri ) errors.push( 'missing-uri' );
    if ( ! data.info?.name?.fullName ) errors.push( 'missing-name' );
    if ( ! Array.isArray( data.related ) ) errors.push( 'invalid-related' );
    if ( ! Array.isArray( data.media ) ) errors.push( 'invalid-media' );
    if ( ! Array.isArray( data.assets ) ) errors.push( 'invalid-assets' );
    if ( ! Array.isArray( data.annual ) ) errors.push( 'invalid-annual' );
  }

  public static run () : void {}
}
