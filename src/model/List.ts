import type { TListIndexItem, TListSnapshot } from '@rtbnext/schema/src/model/list';

import { Snapshot } from '@/abstract/Snapshot';
import type { IList } from '@/interface/list';
import { ListIndex } from '@/model/ListIndex';


export class List extends Snapshot< TListSnapshot > implements IList {
  private static readonly index = ListIndex.getInstance();

  private readonly uri: string;
  private item: TListIndexItem;

  private constructor ( item?: TListIndexItem ) {
    if ( ! item ) throw new Error( `List index item not given` );

    super( 'list', 'json' );
    this.uri = item.uri;
    this.item = item;
  }

  // --- getter ---

  public getUri () : string {
    return this.uri;
  }

  public getItem () : TListIndexItem {
    return this.item;
  }
}
