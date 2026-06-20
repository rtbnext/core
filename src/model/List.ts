import type { TListIndexItem, TListSnapshot } from '@rtbnext/schema/src/model/list';

import { Snapshot } from '@/abstract/Snapshot';
import type { IList } from '@/interface/list';
import { ListIndex } from '@/model/ListIndex';
import { log } from '@/core/Logger';


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

  // --- instantiate ---

  public static get ( uriLike: string ) : IList | false {
    try { return new List( List.index.get( uriLike ) ) }
    catch { return false }
  }

  // --- create list ---

  public static create ( uriLike: string, data: TListIndexItem, snapshot?: Omit< TListSnapshot, '$metadata' > ) : List | false {
    log.debug( `Creating List ${ uriLike }` );

    return log.catch( () => {
      const item = List.index.add( uriLike, data );
      if ( ! item ) throw new Error( `List index item for ${ uriLike } could not be created` );

      const list = new List( item );
      if ( ! list ) throw new Error( `List ${ item.uri } could not be created` );

      if ( snapshot ) list.saveSnapshot( snapshot );
      return list;
    }, `Failed to create List ${ uriLike }` ) ?? false;
  }
}
