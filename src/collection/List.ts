import { ListIndex } from '@/collection/ListIndex';
import { Storage } from '@/core/Storage';
import { TListIndexItem } from '@/types/list';
import { join } from 'node:path';

export class List {

    private static readonly storage = Storage.getInstance();
    private static readonly index = ListIndex.getInstance();

    private readonly uri: string;
    private readonly path: string;
    private data: TListIndexItem;
    private dates: string[];

    private constructor ( item?: TListIndexItem ) {
        if ( ! item ) throw new Error( `List index item not given` );

        this.uri = item.uri;
        this.path = join( 'list', item.uri );
        this.data = item;
        this.dates = List.storage.scanDir( this.path );
    }

    public static get ( uriLike: string ) : List | false {
        try { return new List( List.index.get( uriLike ) ) }
        catch { return false }
    }

}
