import type { TProfileData } from '@rtbnext/schema/src/model/profile';

import type { IProfile } from '@/interface/profile';
import { Profile } from '@/model/Profile';
import type { TQueueOptions } from '@/type/queue';
import type { TProfileLookupResult, TProfileOperation } from '@/type/utils';
import { ProfileMerger } from '@/util/ProfileMerger';


export class ProfileManager {
  private static execute (
    lookup: TProfileLookupResult, uriLike: string, profileData: Partial< TProfileData >,
    aliases: string[] = [], method: 'setData' | 'updateData' = 'updateData'
  ) : IProfile | false {
    const { profile, isExisting, isSimilar } = lookup;

    if ( isExisting && profile ) {
      profile[ method ]( profileData as TProfileData, aliases );
      profile.save();
      return profile;
    }

    if ( isSimilar && profile ) {
      profile[ method ]( profileData as TProfileData, aliases );
      profile.move( uriLike, true );
      return profile;
    }

    return Profile.create( uriLike, profileData as TProfileData, [], aliases );
  }

  // --- lookup profile by URI and ID, or find a similar matching profile ---

  public static lookup ( uriLike: string, id?: string, profileData?: Partial< TProfileData > ) : TProfileLookupResult {
    let profile = Profile.find( uriLike );
    const isExisting = profile && profile.verify( id ?? '' );
    const isSimilar = ! isExisting && !! ( profile = ProfileMerger.findMatching( profileData ?? {} )[ 0 ] );

    return { profile, isExisting, isSimilar };
  }

  // --- determine action based on profile lookup ---

  public static determineAction ( lookup: TProfileLookupResult ) : TProfileOperation {
    return lookup.isExisting ? 'update' : lookup.isSimilar ? 'merge' : 'create';
  }

  // --- handle URI change ---

  public static handleURIChange ( profile: IProfile, newUri: string, makeAlias: boolean = true ) : boolean {
    return profile.getUri() !== newUri ? profile.move( newUri, makeAlias ) : false;
  }

  // --- perform profile operation ---

  public static process (
    uriLike: string, id: string, profileData: Partial< TProfileData >,
    aliases: string[] = [], method: 'setData' | 'updateData' = 'updateData'
  ) : { profile: IProfile | false; action: TProfileOperation, success: boolean } {
    const lookup = this.lookup( uriLike, id, profileData );
    const action = this.determineAction( lookup );
    const profile = this.execute( lookup, uriLike, profileData, aliases, method );

    if ( profile && action !== 'create' ) this.handleURIChange( profile, uriLike );
    return { profile, action, success: !! profile };
  }

  // --- add queue item based on action ---

  public static updateQueue ( queue: TQueueOptions[], profile: IProfile, action: TProfileOperation, th?: number ) : void {
    const uriLike = profile.getUri();

    switch ( action ) {
      case 'update': if ( ! th || profile.lastLookupTime() < th ) queue.push( { uriLike } ); break;
      case 'merge': queue.push( { uriLike, prio: 5 } ); break;
      case 'create': queue.push( { uriLike, prio: 10 } ); break;
    }
  }
}
