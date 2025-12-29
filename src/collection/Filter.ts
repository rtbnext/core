import { Storage } from '@/core/Storage';
import { TFilter, TFilterCollection, TFilterList } from '@/types/filter';
import { FilterGroup, FilterSpecial } from '@/utils/Const';
import { Utils } from '@/utils/Utils';

export class Filter {

    private static instance: Filter;
    private static readonly storage = Storage.getInstance();

    private data: Partial< TFilterCollection > = {};

    private constructor () {
        for ( const group of FilterGroup ) Filter.storage.ensurePath( `filter/${group}`, true );
    }

    private resolvePath ( path: string ) : [ FilterGroup | 'special', string ] | undefined {
        const [ group, key ] = path.replace( '.json', '' ).split( '/' ).slice( -2 );
        return group && key ? [ group as any, key ] : undefined;
    }

    private prepFilter ( list: TFilter[] ) : TFilter[] {
        return [ ...new Map( list.map( i => [ i.uri, i ] ) ).values() ].sort(
            ( a, b ) => a.uri.localeCompare( b.uri )
        );
    }

    private setFilterData ( path: string, items: TFilter[] ) : void {
        const [ group, key ] = this.resolvePath( path ) ?? [];
        if ( ! group || ! key ) return;

        if ( group === 'special' ) ( this.data.special ??= {} as Record< FilterSpecial, TFilter[] > )[ key as FilterSpecial ] = items;
        else ( this.data[ group as FilterGroup ] ??= {} as Record< string, TFilter[] > )[ key ] = items;
    }

    private loadFilter ( path: string ) : void {
        const list = Filter.storage.readJSON< TFilterList >( `filter/${path}.json` );
        if ( list ) this.setFilterData( path, list.items );
    }

    private saveFilter ( path: string, list: TFilter[] ) : void {
        const items = this.prepFilter( list );
        this.setFilterData( path, items );
        Filter.storage.writeJSON< TFilterList >( `filter/${path}.json`, {
            ...Utils.metaData(), items, count: items.length
        } );
    }

    private saveGroup ( group: FilterGroup, data: Record< string | number, TFilter[] > ) : void {
        for ( const [ k, list ] of Object.entries( data ) ) this.saveFilter( `${group}/${k}`, list );
    }

    private saveSpecial ( special: FilterSpecial, data: TFilter[] ) : void {
        this.saveFilter( `special/${special}`, data );
    }

    public getFilter ( path: string ) : TFilter[] | false {
        const [ group, key ] = this.resolvePath( path ) ?? [];
        if ( ! group || ! key ) return false;

        if ( ! this.data[ group ] || ! ( this.data[ group ] as any )![ key ] ) {
            this.loadFilter( `${group}/${key}` );
        }

        return this.data[ group ] ? ( this.data[ group ] as any )[ key ] ?? [] : [];
    }

    public getGroup ( group: FilterGroup ) : Record< string, TFilter[] > {
        for ( const file of Filter.storage.scanDir( `filter/${group}` ) ) {
            const key = file.replace( '.json', '' ).split( '/' ).pop();
            if ( key && ( ! this.data[ group ] || ! ( this.data[ group ] as any )![ key ] ) ) {
                this.loadFilter( `${group}/${key}` );
            }
        }
        return this.data[ group ] || {};
    }

    public getSpecial ( special: FilterSpecial ) : TFilter[] {
        for ( const file of Filter.storage.scanDir( `filter/special` ) ) {
            const key = file.replace( '.json', '' ).split( '/' ).pop();
            if ( key === special && ( ! this.data.special || ! this.data.special[ special ] ) ) {
                this.loadFilter( `special/${special}` );
            }
        }
        return this.data.special?.[ special ] || [];
    }

    public has ( path: string, uriLike: string ) : boolean {
        const list = this.getFilter( path );
        if ( ! list ) return false;
        return list.some( i => i.uri === uriLike );
    }

    public save ( collection: Partial< TFilterCollection > ) : void {
        for ( const group of FilterGroup ) if ( collection[ group ] )
            this.saveGroup( group, collection[ group ] );
        for ( const special of FilterSpecial ) if ( collection.special?.[ special ] )
            this.saveSpecial( special, collection.special[ special ] );
    }

    public static getInstance () : Filter {
        return Filter.instance ||= new Filter();
    }

}
