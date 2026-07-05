import { ArrayMode } from '@komed3/deepmerge';
import type { TIndex, TMetaData } from '@rtbnext/schema/src/base/generic';

import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import type { IIndex } from '@/interface/index';


export abstract class Index<
  I extends TIndex,
  D extends TMetaData & { count: number, items: I[] },
  M extends Map< string, I >
> implements IIndex< I, D, M > {
  protected static readonly storage = Storage.getInstance();

  protected readonly type: 'profile' | 'list';
  protected readonly path: string;
  protected index: M;

  protected constructor ( type: 'profile' | 'list', path: string ) {
    this.type = type;
    this.path = path;
    Index.storage.ensurePath( this.path );
    this.index = this.loadIndex();
  }

  // --- load & save index ---

  protected loadIndex () : M {
    const raw = Index.storage.readJSON< D >( this.path ) || { count: 0, items: [] };
    log.debug( `Index [${ this.type }] loaded: ${ raw.count } items` );

    return new Map( raw.items.map( i => [ i.uri, i ] ) ) as M;
  }

  protected saveIndex () : void {
    Index.storage.writeJSON< D >( this.path, {
      ...Utils.metaData(), items: [ ...this.index.values() ], count: this.index.size
    } as D );
  }

  // --- basic operations ---

  public get size () : number {
    return this.index.size;
  }

  public get values () : IterableIterator< I > {
    return this.index.values();
  }

  public get keys () : IterableIterator< string > {
    return this.index.keys();
  }

  public getIndex () : M {
    return this.index;
  }

  public has ( uriLike: string ) : boolean {
    return this.index.has( Utils.sanitize( uriLike ) );
  }

  public get ( uriLike: string ) : I | undefined {
    return this.index.get( Utils.sanitize( uriLike ) );
  }

  // --- manipulate index (add, update, remove items) ---

  public update ( uriLike: string, data: Partial< I >, allowUpdate: boolean = true, save: boolean = true ) : I | false {
    return log.catch( () => {
      const uri = Utils.sanitize( uriLike );
      if ( ! allowUpdate && this.index.has( uri ) ) return false;

      log.debug( `Updating index [${ this.type }] item: ${ uri }`, data );
      const item = Utils.merge< I >( ArrayMode.Unique, this.index.get( uri ) ?? {}, data );
      this.index.set( uri, item );

      if ( save ) this.saveIndex();
      return item;
    }, `Failed to update index [${ this.type }] item: ${ uriLike }` ) ?? false;
  }

  public delta ( items: Array< { uriLike: string, data: Partial< I > } >, allowUpdate: boolean = true ) : number {
    const updated = items.reduce( ( count, { uriLike, data } ) => count + (
      this.update( uriLike, data, allowUpdate, false ) ? 1 : 0
    ), 0 );

    this.saveIndex();
    log.debug( `Index [${ this.type }] delta applied: ${ updated } items updated` );
    return updated;
  }

  public add ( uriLike: string, data: I ) : I | false {
    log.debug( `Adding index [${ this.type }] item: ${ uriLike }` );
    return this.update( uriLike, data, false );
  }

  public delete ( uriLike: string ) : void {
    log.debug( `Deleting index [${ this.type }] item: ${ uriLike }` );
    this.index.delete( Utils.sanitize( uriLike ) );
    this.saveIndex();
  }

  // --- search index items ---

  public search ( query: string, looseMatch: boolean = false ) : M {
    const tokens = Utils.buildSearchText( query ).split( ' ' ).filter( Boolean );
    return new Map( [ ...this.index ].filter( ( [ _, { text } ] ) => Utils.tokenSearch( text, tokens, looseMatch ) ) ) as M;
  }
}
