import type { TFilterGroup, TFilterSpecial } from '@rtbnext/schema/src/base/const';
import type { TFilter, TFilterCollection, TFilterIndex, TFilterItem, TFilterList } from '@rtbnext/schema/src/model/filter';
import type { TProfileData } from '@rtbnext/schema/src/model/profile';
import { join } from 'node:path';

import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import type { IFilter } from '@/interface/filter';
import { FilterGroup, FilterSpecial } from '@/lib/const';
import { Parser } from '@/parser/Parser';


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

  // --- load & save filter ---

  private loadFilter ( group: TFilterGroup, key: string ) : TFilter | undefined {
    log.debug( `Loading filter from ${ group }/${ key }` );

    return log.catch( () => {
      const resolved = this.joinPath( group, key );
      if ( ! resolved ) throw new Error( `Invalid filter path: ${ group }/${ key }` );

      const filter = Filter.storage.readJSON< TFilter >( resolved );
      if ( ! filter ) throw new Error( `Filter file not found: ${ resolved }` );

      this.setFilterData( group, key, filter );
      return filter;
    }, `Failed to load filter at ${ group }/${ key }` );
  }

  private saveFilter ( group: TFilterGroup, key: string, list: TFilterItem[] ) : void {
    log.debug( `Saving filter to ${ group }/${ key }` );

    log.catch( () => {
      const resolved = this.joinPath( group, key );
      if ( ! resolved ) throw new Error( `Invalid filter path: ${ group }/${ key }` );

      const items = this.prepFilter( list );
      const filter = { ...Utils.metaData(), items, count: items.length };
      this.setFilterData( group, key, filter );

      if ( ! Filter.storage.writeJSON< TFilter >( resolved, filter ) )
        throw new Error( `Failed to write filter file: ${ resolved }` );
    }, `Failed to save filter at ${ group }/${ key }` );
  }

  private saveGroup ( group: TFilterGroup, data: Record< string, TFilterItem[] > ) : void {
    Object.entries( data ).forEach( ( [ key, list ] ) => this.saveFilter( group, key, list ) );
  }

  private saveSpecial ( special: TFilterSpecial, data: TFilterItem[] ) : void {
    this.saveFilter( 'special', special, data );
  }

  // --- getter ---

  public getFilter ( group: TFilterGroup, key: string ) : TFilter | undefined {
    return ( this.data[ group ] as any )?.[ key ] ?? this.loadFilter( group, key );
  }

  public getFilterByPath ( path: string ) : TFilter | undefined {
    const [ group, key ] = this.splitPath( path ) ?? [];
    return group && key ? this.getFilter( group, key ) : undefined;
  }

  public getGroup ( group: TFilterGroup ) : Record< string, TFilter > | undefined {
    Filter.storage.scanDir( join( 'filter', group ) ).forEach( file => {
      const key = file.replace( '.json', '' ).split( '/' ).pop();
      if ( key && ! ( this.data[ group ] as any )?.[ key ] ) this.loadFilter( group, key );
    } );

    return this.data[ group ];
  }

  public getSpecial ( special: TFilterSpecial ) : TFilter | undefined {
    Filter.storage.scanDir( 'filter/special' ).forEach( file => {
      const key = file.replace( '.json', '' ).split( '/' ).pop();
      if ( key && ! this.data.special?.[ special ] ) this.loadFilter( 'special', special );
    } );

    return this.data.special?.[ special ];
  }

  // --- has filter ---

  public has ( path: string, uriLike: string ) : boolean {
    const [ group, key ] = this.splitPath( path ) ?? [];
    const uri = Utils.sanitize( uriLike );

    return !! group && !! key && !! ( this.getFilter( group, key )?.items?.some( i => i.uri === uri ) );
  }

  // --- save (partial) filter collection ---

  public save ( col: Partial< TFilterList > ) : boolean {
    FilterGroup.forEach( g => g !== 'special' && col[ g ] && this.saveGroup( g, col[ g ] ) );
    FilterSpecial.forEach( s => col.special?.[ s ] && this.saveSpecial( s, col.special[ s ] ) );

    return this.generateIndex();
  }

  // --- filter index ---

  public getIndex () : TFilterIndex | undefined {
    return Filter.storage.readJSON< TFilterIndex >( 'filter/index.json' ) || undefined;
  }

  public generateIndex () : boolean {
    return log.catch( () => {
      const data = Utils.metaData() as TFilterIndex;

      FilterGroup.forEach( group => {
        ( data as any )[ group ] = Filter.storage.scanDir( join( 'filter', group ) )
          .map( file => file.replace( '.json', '' ).split( '/' ).pop() )
          .filter( ( key ) : key is string => !! key );
      } );

      return Filter.storage.writeJSON( 'filter/index.json', data );
    }, 'Failed to generate filter index' ) ?? false;
  }

  // --- instantiate ---

  public static getInstance () : IFilter {
    return Filter.instance ??= new Filter();
  }

  // --- aggregate filter data ---

  public static aggregate ( data: TProfileData, filter: Partial< TFilterList > ) : void {
    const { uri, info, realtime } = data;
    const item: TFilterItem = { uri, name: info.name.shortName, value: undefined };
    const decade = Parser.ageGroup( info.birthDate );

    const add = ( g: TFilterGroup, k: string | undefined, v: any = null ) : void => {
      g && k && ( ( ( filter as any )[ g ] ??= {} )[ k ] ??= [] ) &&
      ( filter as any )[ g ][ k ].push( { ...item, value: v === null ? k : v } )
    };

    add( 'industry', info.industry );
    add( 'citizenship', info.citizenship );
    add( 'country', info.residence?.country );
    add( 'state', info.residence?.state );
    add( 'gender', info.gender );
    add( 'age', decade, info.birthDate );
    add( 'maritalStatus', info.maritalStatus );

    info.flags.deceased && add( 'special', 'deceased', undefined );
    info.flags.dropOff && add( 'special', 'dropOff', realtime?.date );
    info.flags.family && add( 'special', 'family', undefined );
    info.selfMade?.is && add( 'special', 'selfMade', info.selfMade.rank );
  }
}
