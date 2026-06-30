import type { TProfileData } from '@rtbnext/schema/src/model/profile';

import type { IProfile } from '@/interface/profile';
import { Profile } from '@/model/Profile';
import type { TProfileLookupResult, TProfileOperation, TProfileProcessResult } from '@/type/profile';
import type { TQueueOptions } from '@/type/queue';
import { ProfileMerger } from '@/util/ProfileMerger';


export class ProfileManager {
  private static execute (
    profile: IProfile | false, action: TProfileOperation, uriLike: string, profileData: Partial< TProfileData >,
    method: 'setData' | 'updateData' = 'updateData', makeAlias: boolean = true
  ) : IProfile | false {
    if ( profile ) switch ( action ) {
      case 'update':
        profile[ method ]( profileData as TProfileData );
        profile.save();
        return profile;
      case 'move':
        profile[ method ]( profileData as TProfileData );
        profile.move( uriLike, makeAlias );
        return profile;
    }

    return Profile.create( uriLike, profileData as TProfileData, [] );
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
    return lookup.isExisting ? 'update' : lookup.isSimilar ? 'move' : 'create';
  }

  // --- perform profile operation ---

  public static process (
    uriLike: string, id: string, profileData: Partial< TProfileData >,
    method: 'setData' | 'updateData' = 'updateData', makeAlias: boolean = true
  ) : TProfileProcessResult {
    const lookup = this.lookup( uriLike, id, profileData );
    const action = this.determineAction( lookup );
    const profile = this.execute( lookup.profile, action, uriLike, profileData, method, makeAlias );

    return { profile, action, success: !! profile };
  }

  // --- add queue item based on action ---

  public static updateQueue ( queue: TQueueOptions[], profile: IProfile, action: TProfileOperation, th?: number ) : void {
    const uriLike = profile.getUri();

    switch ( action ) {
      case 'update': if ( ! th || ( profile.lastLookupTime() ?? 0 ) < th ) queue.push( { uriLike } ); break;
      case 'move': queue.push( { uriLike, prio: 5 } ); break;
      case 'create': queue.push( { uriLike, prio: 10 } ); break;
    }
  }
}
