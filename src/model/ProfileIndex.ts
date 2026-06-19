import type { TProfileIndex, TProfileIndexItem } from '@rtbnext/schema/src/model/profile';

import { Index } from '@/abstract/Index';
import { Utils } from '@/core/Utils';
import type { IProfileIndex } from '@/interface/index';


export class ProfileIndex extends Index< TProfileIndexItem, TProfileIndex > implements IProfileIndex {
  protected static instance: IProfileIndex;

  private constructor () {
    super( 'profile', 'profile/index.json' );
  }

  // --- special profile index operations ---

  public find ( uriLike: string ) : TProfileIndex {
    const uri = Utils.sanitize( uriLike );
    return new Map( [ ...this.index ].filter( ( [ key, { aliases } ] ) => key === uri || aliases.includes( uri ) ) );
  }

  // --- instantitate ---

  public static getInstance () : IProfileIndex {
    return ProfileIndex.instance ??= new ProfileIndex();
  }
}
