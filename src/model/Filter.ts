import { FilterGroup } from '@/core/Const';
import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import { IFilter } from '@/interfaces/filter';
import { TFilterGroup, TFilterSpecial } from '@rtbnext/schema/src/abstract/const';
import { TFilter, TFilterCollection, TFilterList } from '@rtbnext/schema/src/model/filter';
import { join } from 'node:path';

export class Filter implements IFilter {

    private static readonly storage = Storage.getInstance();
    private static instance: Filter;

    private data: Partial< TFilterCollection > = {};

    private constructor () {
        this.initDB();
    }

    // Path helper

    private splitPath ( path: string ) : [ TFilterGroup, string ] | undefined {
        const [ group, key ] = path.replace( '.json', '' ).split( '/' ).slice( -2 );
        return FilterGroup.includes( group as any ) && key ? [ group as any, key ] : undefined;
    }

    private joinPath ( group?: TFilterGroup, key?: string ) : string | false {
        return group && key ? join( 'filter', group, `${key}.json` ) : false;
    }

    private resolvePath ( path: string ) : string | false {
        return this.joinPath( ...( this.splitPath( path ) ?? [] ) as any );
    }

    // Helper methods

    private prepFilter ( list: TFilter[] ) : TFilter[] {
        return [ ...new Map( list.map( i => [ i.uri, i ] ) ).values() ].sort(
            ( a, b ) => a.uri.localeCompare( b.uri )
        );
    }

    private setFilterData ( group: TFilterGroup, key: string, items: TFilter[] ) : void {
        ( this.data[ group ] ??= {} as any )[ key ] = items;
    }

    // Load & save filter

    private loadFilter ( group: TFilterGroup, key: string ) : void {
        log.debug( `Loading filter from ${group}/${key}` );
        log.catch( () => {
            const resolved = this.joinPath( group, key );
            if ( ! resolved ) throw new Error( `Invalid filter path: ${group}/${key}` );

            const list = Filter.storage.readJSON< TFilterList >( resolved );
            if ( ! list ) throw new Error( `Filter file not found: ${resolved}` );

            this.setFilterData( group, key, list.items );
        }, `Failed to load filter at ${group}/${key}` );
    }

    private saveFilter ( group: TFilterGroup, key: string, list: TFilter[] ) : void {
        log.debug( `Saving filter to ${group}/${key}` );
        log.catch( () => {
            const resolved = this.joinPath( group, key );
            if ( ! resolved ) throw new Error( `Invalid filter path: ${group}/${key}` );

            const items = this.prepFilter( list );
            this.setFilterData( group, key, items );

            if ( ! Filter.storage.writeJSON< TFilterList >( resolved, {
                ...Utils.metaData(), items, count: items.length
            } ) ) throw new Error( `Failed to write filter file: ${resolved}` );
        }, `Failed to save filter at ${group}/${key}` );
    }

    // Init DB

    public initDB () : void {
        log.debug( 'Initializing filter storage paths' );
        [ ...FilterGroup, 'special' ].forEach(
            group => Filter.storage.ensurePath( join( 'filter', group ), true )
        );
    }

    // Instantiate

    public static getInstance () : Filter {
        return Filter.instance ||= new Filter();
    }

}
