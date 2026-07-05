import type { TListIndex, TListIndexItem, TListIndexMap } from '@rtbnext/schema/src/model/list';

import { Index } from '@/abstract/Index';
import type { IListIndex } from '@/interface/index';


export class ListIndex extends Index< TListIndexItem, TListIndex, TListIndexMap > implements IListIndex {
  protected static instance: ListIndex;
  private constructor () { super( 'list', 'list/index.json' ) }

  public static getInstance () : IListIndex {
    return ListIndex.instance ??= new ListIndex();
  }
}
