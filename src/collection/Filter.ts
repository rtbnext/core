import { Storage } from '@/core/Storage';
import { TFilter, TFilterCollection, TFilterList } from '@/types/filter';
import { Utils } from '@/utils';

export class Filter {

    private static instance: Filter;
    private static readonly storage = Storage.getInstance();

    private data: Partial< TFilterCollection > = {};
    private readonly filterGroups = [
        'industry', 'citizenship', 'country', 'state', 'gender',
        'age', 'maritalStatus', 'special'
    ];

    private constructor () {
        for ( const g of this.filterGroups ) Filter.storage.ensurePath( `filter/${g}`, true );
    }

    private saveFilter ( path: string, list: TFilter[] ) : void {
        const items = [ ...new Map( list.map( i => [ i.uri, i ] ) ).values() ].sort(
            ( a, b ) => a.uri.localeCompare( b.uri )
        );

        Filter.storage.writeJSON< TFilterList >( path, {
            ...Utils.metaData(), items, count: items.length
        } );
    }

    public static getInstance () : Filter {
        return Filter.instance ||= new Filter();
    }

}
