import type { TProfileData } from '@rtbnext/schema/src/model/profile';

import { log } from '@/core/Logger';
import type { IProfile } from '@/interface/profile';
import { Profile } from '@/model/Profile';
import { ProfileIndex } from '@/model/ProfileIndex';
import type { TProfileLookupResult, TProfileOperation, TProfileProcessResult, TProfileUpdateMode } from '@/type/profile';
import type { TQueueOptions } from '@/type/queue';
import { ProfileMerger } from '@/util/ProfileMerger';


export class ProfileManager {
  private static readonly index = ProfileIndex.getInstance();

  private static execute (
    profile: IProfile | false, action: TProfileOperation, uriLike: string, profileData: Partial< TProfileData >,
    mode: TProfileUpdateMode = 'updateData', makeAlias: boolean = true, touchLookup: boolean = false
  ) : IProfile | false {
    if ( ! profile ) return Profile.create( uriLike, profileData as TProfileData );
    if ( touchLookup ) profile.touchLookup();

    switch ( action ) {
      case 'update':
        if ( mode !== 'createOnly' ) {
          profile[ mode ]( profileData as TProfileData );
          profile.save();
        }
        break;

      case 'move':
        if ( mode !== 'createOnly' ) {
          profile[ mode ]( profileData as TProfileData );
          profile.move( uriLike, makeAlias );
        } else if ( makeAlias ) {
          this.index.addAliases( profile.getUri(), uriLike );
        }
        break;
    }

    return profile;
  }

  // --- lookup profile by URI and ID, or find a similar matching profile ---

  public static lookup ( uriLike: string, id?: string, profileData?: Partial< TProfileData > ) : TProfileLookupResult {
    let profile = Profile.find( uriLike ) ?? false;
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
    uriLike: string, id: string, profileData: Partial< TProfileData >, mode: TProfileUpdateMode = 'updateData',
    makeAlias: boolean = true, touchLookup: boolean = false
  ) : TProfileProcessResult | false {
    return log.catch( () => {
      const lookup = this.lookup( uriLike, id, profileData );
      const action = this.determineAction( lookup );
      const profile = this.execute( lookup.profile, action, uriLike, profileData, mode, makeAlias, touchLookup );

      return { profile, action, success: !! profile };
    }, `Failed to process profile for ${ uriLike }` ) ?? false;
  }

  // --- add queue item based on action ---

  public static updateQueue ( queue: TQueueOptions[], profile: IProfile, action: TProfileOperation, th?: number ) : void {
    const uriLike = profile.getUri();

    switch ( action ) {
      case 'update': if ( ! th || ( profile.lastLookupTime ?? 0 ) < th ) queue.push( { uriLike } ); break;
      case 'move': queue.push( { uriLike, prio: 5 } ); break;
      case 'create': queue.push( { uriLike, prio: 10 } ); break;
    }
  }
}
