import type { TProfileData } from '@rtbnext/schema/src/model/profile';

import { Profile } from '@/model/Profile';
import type { TProfileLookupResult } from '@/type/utils';


export class ProfileManager {
  private static execute (
    lookup: TProfileLookupResult, uriLike: string, profileData: Partial< TProfileData >,
    aliases: string[] = [], method: 'setData' | 'updateData' = 'updateData'
  ) : Profile | false {
    const { profile, isExisting, isSimilar } = lookup;

    if ( isExisting && profile ) {
      profile[ method ]( profileData as any, aliases );
      profile.save();
      return profile;
    }

    if ( isSimilar && profile ) {
      profile[ method ]( profileData as any, aliases );
      profile.move( uriLike, true );
      return profile;
    }

    return Profile.create( uriLike, profileData as TProfileData, [], aliases );
  }
}
