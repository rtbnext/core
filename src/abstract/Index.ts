import type { TIndex } from '@rtbnext/schema/src/base/generic';

import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import type { IIndex } from '@/interface/index';


export abstract class Index< I extends TIndex, T extends Map< string, I > > implements IIndex< I, T > {
  protected static readonly storage = Storage.getInstance();
  protected readonly type: 'profile' | 'list';
  protected readonly path: string;
  protected index: T;

  protected constructor ( type: 'profile' | 'list', path: string ) {
    this.type = type;
    this.path = path;
    Index.storage.ensurePath( this.path );
    this.index = this.loadIndex();
  }

  // --- load & save index ---

  protected loadIndex () : T {
    const raw = Index.storage.readJSON< Record< string, I > > ( this.path ) ?? {};
    log.debug( `Index [${ this.type }] loaded: ${ Object.keys( raw ).length } items` );

    return new Map( Object.entries( raw ) ) as T;
  }

  protected saveIndex () : void {
    const content = Object.fromEntries( this.index );
    Index.storage.writeJSON< Record< string, I > >( this.path, content );
  }

  // --- basic operations ---

  public get size () : number {
    return this.index.size;
  }

  public getIndex () : T {
    return this.index;
  }

  public has ( uriLike: string ) : boolean {
    return this.index.has( Utils.sanitize( uriLike ) );
  }

  public get ( uriLike: string ) : I | undefined {
    return this.index.get( Utils.sanitize( uriLike ) );
  }
}
