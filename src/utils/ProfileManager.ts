import type { TProfileData } from '@rtbnext/schema/src/model/profile';

import type { IProfile } from '@/interface/profile';
import { Profile } from '@/model/Profile';
import type { TProfileLookupResult, TProfileOperation, TProfileProcessResult } from '@/type/profile';
import { ProfileMerger } from '@/util/ProfileMerger';


export class ProfileManager {
  private static execute (
    lookup: TProfileLookupResult, action: TProfileOperation, uriLike: string, profileData: Partial< TProfileData >,
    method: 'setData' | 'updateData' = 'updateData', makeAlias: boolean = true
  ) : IProfile | false {
    const { profile } = lookup;

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
    method: 'setData' | 'updateData' = 'updateData', makeAlias: boolean = false
  ) : TProfileProcessResult {
    const lookup = this.lookup( uriLike, id, profileData );
    const action = this.determineAction( lookup );
    const profile = this.execute( lookup, action, uriLike, profileData, method, makeAlias );

    return { profile, action, success: !! profile };
  }
}
