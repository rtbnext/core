import type { TListIndexItem, TListSnapshot, TListSnapshotData } from '@rtbnext/schema/src/model/list';

import { Snapshot } from '@/abstract/Snapshot';
import { log } from '@/core/Logger';
import { Utils } from '@/core/Utils';
import type { IList } from '@/interface/list';
import { ListIndex } from '@/model/ListIndex';


export class List extends Snapshot< TListSnapshot > implements IList {
  private static readonly index = ListIndex.getInstance();
  private readonly uri: string;

  private constructor ( item?: TListIndexItem ) {
    if ( ! item || ! item.uri ) throw new Error( 'No valid list index item given' );

    super( 'list' );
    this.uri = item.uri;
  }

  // --- getter ---

  public getUri () : string {
    return this.uri;
  }

  // --- (override) save list snapshot ---

  public override saveSnapshot ( snapshot: TListSnapshotData, force: boolean = false ) : boolean {
    return super.saveSnapshot( { ...Utils.metaData(), ...snapshot }, force );
  }

  // --- instantiate ---

  public static get ( uriLike: string ) : IList | false {
    try { return new List( List.index.get( uriLike ) ) }
    catch { return false }
  }

  // --- create list ---

  public static create ( uriLike: string, data: TListIndexItem, snapshot?: TListSnapshotData ) : List | false {
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
