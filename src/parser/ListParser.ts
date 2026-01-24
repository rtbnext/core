import { Utils } from '@/core/Utils';
import { IListParser } from '@/interfaces/parser';
import { TListResponse } from '@/types/response';

export type TListResponseEntry = TListResponse[ 'personList' ][ 'personsLists' ][ number ];

export class ListParser implements IListParser {

    private readonly raw: TListResponseEntry;
    private cachedData: Map< string, any > = new Map();

    constructor ( raw: TListResponseEntry ) {
        this.raw = raw;
    }

    // Caching

    private cache< T = any > ( key: string, fn: () => T ) : T {
        if ( ! this.cachedData.has( key ) ) this.cachedData.set( key, fn() );
        return this.cachedData.get( key );
    }

    // Raw data

    public rawData () : TListResponseEntry {
        return this.raw;
    }

    // URIs & IDs

    public uri () : string {
        return this.cache( 'uri', () => Utils.sanitize( this.raw.uri ) );
    }

    public id () : string {
        return this.cache( 'id', () => Utils.hash( this.raw.naturalId ) );
    }

}
