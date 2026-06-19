import type { TListIndex, TListIndexItem } from '@rtbnext/schema/src/model/list';

import { Index } from '@/abstract/Index';
import type { IListIndex } from '@/interface/index';


export class ListIndex extends Index< TListIndexItem, TListIndex > implements IListIndex {
  protected static instance: ListIndex;
  private constructor () { super( 'list', 'list/index.json' ) }

  public static getInstance () : IListIndex {
    return ListIndex.instance ??= new ListIndex();
  }
}
