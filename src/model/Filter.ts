import type { TFilterGroup } from '@rtbnext/schema/src/base/const';
import type { TFilter, TFilterCollection, TFilterItem } from '@rtbnext/schema/src/model/filter';
import { join } from 'node:path';

import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import type { IFilter } from '@/interface/filter';
import { FilterGroup } from '@/lib/const';


export class Filter implements IFilter {
  private static readonly storage = Storage.getInstance();
  private static instance: IFilter;

  private data: Partial< TFilterCollection > = {};

  private constructor () {
    this.initDB();
  }

  private initDB () : void {
    log.debug( 'Initializing filter storage paths' );
    FilterGroup.forEach( group => Filter.storage.ensurePath( join( 'filter', group ), true ) );
  }

  // --- helper ---

  private prepFilter ( list: TFilterItem[] ) : TFilterItem[] {
    return [ ...new Map( list.map( i => [ i.uri, i ] ) ).values() ]
      .sort( ( a, b ) => a.uri.localeCompare( b.uri ) );
  }

  private setFilterData ( group: TFilterGroup, key: string, filter: TFilter ) : void {
    ( this.data[ group ] ??= {} as any )[ key ] = filter;
  }

  // --- path helper ---

  private splitPath ( path: string ) : [ TFilterGroup, string ] | undefined {
    const [ group, key ] = path.replace( '.json', '' ).split( '/' ).slice( -2 );
    return FilterGroup.includes( group as TFilterGroup ) && key ? [ group as TFilterGroup, key ] : undefined;
  }

  private joinPath ( group?: TFilterGroup, key?: string ) : string | false {
    return group && key ? join( 'filter', group, `${ key }.json` ) : false;
  }

  public resolvePath ( path: string ) : string | false {
    return this.joinPath( ...( this.splitPath( path ) ?? [] ) as [ TFilterGroup, string ] );
  }
}
