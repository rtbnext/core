import type { TProfileData } from '@rtbnext/schema/src/model/profile';
import type { TSearchIndexItem } from '@rtbnext/schema/src/model/search';

import { Storage } from '@/core/Storage';
import type { ISearch } from '@/interface/search';


export class Search implements ISearch {
  private static readonly storage = Storage.getInstance();
  private static instance: ISearch;

  private constructor () {}

  // --- instantiate ---
  
  public static getInstance () : ISearch {
    return Search.instance ??= new Search();
  }

  // --- aggregate search index data ---

  public static aggregate ( data: TProfileData, index: TSearchIndexItem[] ) : void {}
}
