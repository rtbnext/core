import { Utils } from '@/core/Utils';
import { IProfileParser } from '@/interfaces/parser';
import { TProfileResponse } from '@/types/response';

export class ProfileParser implements IProfileParser {

    private readonly raw: TProfileResponse[ 'person' ];
    private readonly lists: TProfileResponse[ 'person' ][ 'personLists' ];
    private cachedData: Map< string, any > = new Map();

    constructor ( res: TProfileResponse ) {
        this.raw = res.person;
        this.lists = res.person.personLists.sort(
            ( a, b ) => Number( b.date ?? 0 ) - Number( a.date ?? 0 )
        );
    }

    private cache< T = any > ( key: string, fn: () => T ) : T {
        if ( ! this.cachedData.has( key ) ) this.cachedData.set( key, fn() );
        return this.cachedData.get( key );
    }

    public uri () : string {
        return this.cache( 'uri', () => Utils.sanitize( this.raw.uri ) );
    }

    public id () : string {
        return this.cache( 'id', () => Utils.hash( this.raw.naturalId ) );
    }

}
