import type { TProfileIndex, TProfileIndexItem } from '@rtbnext/schema/src/model/profile';

import { Index } from '@/abstract/Index';
import type { IProfileIndex } from '../interfaces';


export class ProfileIndex extends Index< TProfileIndexItem, TProfileIndex > implements IProfileIndex {
  protected static instance: IProfileIndex;

  private constructor () {
    super( 'profile', 'profile/index.json' );
  }

  // --- instantitate ---

  public static getInstance () : IProfileIndex {
    return ProfileIndex.instance ??= new ProfileIndex();
  }
}
