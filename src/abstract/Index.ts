import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import { IIndex } from '@/interfaces/index';
import { TIndex } from '@rtbnext/schema/src/abstract/generic';

export abstract class Index<
    I extends TIndex, T extends Map< string, I >
> implements IIndex< I, T > {

    protected static readonly storage = Storage.getInstance();
    protected readonly path: string;
    protected index: T;

    protected constructor ( path: string ) {
        this.path = path;
        Index.storage.ensurePath( this.path );
        this.index = this.loadIndex();
    }

    // Load & save index

    protected loadIndex () : T {
        const raw = Index.storage.readJSON< Record< string, I > > ( this.path ) ?? {};
        log.debug( `Index loaded: ${ Object.keys( raw ).length } items from ${this.path}` );
        return new Map( Object.entries( raw ) ) as T;
    }

    protected saveIndex () : void {
        const content = Object.fromEntries( this.index );
        Index.storage.writeJSON< Record< string, I > >( this.path, content );
    }

    // Basic index operations

    public getIndex () : T {
        return this.index;
    }

    public size () : number {
        return this.index.size;
    }

    public has ( uriLike: string ) : boolean {
        return this.index.has( Utils.sanitize( uriLike ) );
    }

    public get ( uriLike: string ) : I | undefined {
        return this.index.get( Utils.sanitize( uriLike ) );
    }

}
