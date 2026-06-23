import { ArrayMode, Merger } from '@komed3/deepmerge';
import type { TMetaData } from '@rtbnext/schema/src/base/generic';
import type { ListLike } from 'devtypes/types/list';
import { sha256 } from 'js-sha256';
import { hrtime } from 'node:process';

import { REGEX_DIACRITICS, REGEX_NOALNUM } from '@/lib/regex';
import { Parser } from '@/parser/Parser';
import type { TAggregator, TMeasuredResult, TObjOperator } from '@/type/generic';
import type { TParserDateType } from '@/type/parser';


export class Utils {
  private static readonly mergeInstances: { [ K in ArrayMode ]?: Merger } = {};

  // --- sanitize IDs and URIs ---

  public static sanitize ( value: unknown, delimiter: string = '-' ) : string {
    return Parser.string( value ).toLowerCase().replace( REGEX_NOALNUM, delimiter )
      .replace( new RegExp( `[${ delimiter }]{2,}`, 'g' ), delimiter );
  }

  // --- hashing ---

  public static hash ( value: unknown ) : string {
    return sha256( Parser.string( value ).split( '/' ).pop() ?? '' );
  }

  public static verifyHash ( value: unknown, hash: string ) : boolean {
    return value === hash || Utils.hash( value ) === hash;
  }

  // --- measurement ---

  public static async measure <
    F extends ( ...args: any[] ) => any, R = Awaited< ReturnType< F > >
  > ( fn: F ) : Promise< TMeasuredResult< R > > {
    if ( typeof fn !== 'function' ) throw new TypeError( 'Parameter must be a function' );

    const now = hrtime.bigint();
    const diff = () => Number( hrtime.bigint() - now ) / 1e6;

    try { return { result: await fn() as R, ms: diff() } }
    catch ( err ) { throw Object.assign( err ?? {}, { ms: diff() } ) }
  }

  // --- meta data ---

  public static date ( format: TParserDateType = 'ymd' ) : string {
    return Parser.date( undefined, format )!;
  }

  public static metaData < T extends Record< string, unknown > > ( obj?: T ) : TMetaData< T > {
    return { $metadata: { schemaVersion: 2, lastModified: Utils.date( 'iso' ), ...obj } } as TMetaData< T >;
  }

  // --- aggregate from object arrays ---

  public static aggregate <
    T extends Record< PropertyKey, unknown >, K extends keyof T = keyof T, R = unknown
  > (
    arr: readonly T[], key: K, aggregator: TAggregator = 'first'
  ) : T[ K ] | T[ K ][] | number | R | undefined {
    const values = arr.map( item => item[ key ] ).filter( ( v ) : v is T[ K ] => v !== undefined );

    if ( ! values.length ) return undefined;
    if ( typeof aggregator === 'function' ) return aggregator( values );

    const isNum = ( v: unknown ) : v is number => typeof v === 'number' && ! Number.isNaN( v );
    const sum = ( acc: number | undefined, val: T[ K ] ) : number | undefined => (
      acc === undefined || ! isNum( val ) ? undefined : acc + val
    );

    switch ( aggregator ) {
      case 'all': return values;
      case 'first': return values[ 0 ];
      case 'last': return values.at( -1 );
      case 'sum': return values.reduce< number | undefined >( sum, 0 );
      case 'min': return values.reduce< T[ K ] | undefined >( ( acc, val ) => (
        acc === undefined || val < acc! ? val : acc
      ), Infinity as unknown as T[ K ] );
      case 'max': return values.reduce< T[ K ] | undefined >( ( acc, val ) => (
        acc === undefined || val > acc! ? val : acc
      ), -Infinity as unknown as T[ K ] );
      case 'mean':
        const s = values.reduce< number | undefined >( sum, 0 );
        return s === undefined ? undefined : s / values.length;
    }
  }

  // --- deep object updates ---

  public static update ( operator: TObjOperator, obj: any, path: string, n?: any ) : void {
    return path.split( '.' ).reduce( ( curr, p, i, arr ) => (
      i < arr.length - 1 && ( curr[ p ] ??= {} ),
      i === arr.length - 1
        ? ( operator === 'set' ? ( curr[ p ] = n )
          : operator === 'inc' ? ( curr[ p ] = ( curr[ p ] ?? 0 ) + ( n ?? 1 ) )
          : operator === 'max' ? ( curr[ p ] = Math.max( curr[ p ] ?? -Infinity, n ) )
          : operator === 'min' ? ( curr[ p ] = Math.min( curr[ p ] ?? Infinity, n ) )
          : operator === 'append' ? ( curr[ p ] = [ ...( curr[ p ] ?? [] ), n ] )
          : operator === 'prepend' ? ( curr[ p ] = [ n, ...( curr[ p ] ?? [] ) ] )
          : operator( curr[ p ], p )
        )
        : ( curr = curr[ p ] ),
      curr
    ), obj );
  }

  // --- sorting arrays and objects ---

  public static sort < L extends ListLike > (
    value: L, compare?: ( a: any, b: any ) => number, objCompare?: ( a: any, b: any ) => number
  ) : L {
    compare ??= ( a, b ) => ( a > b ? 1 : a < b ? -1 : 0 );
    objCompare ??= ( a, b ) => compare( a[ 0 ], b[ 0 ] );

    return ( Array.isArray( value ) ? [ ...value ].sort( compare )
      : value instanceof Set ? new Set( [ ...value ].sort( compare ) )
      : value instanceof Map ? new Map( [ ...value.entries() ].sort( objCompare ) )
      : typeof value === 'object' ? Object.fromEntries( Object.entries( value ).sort( objCompare ) )
      : [ ...value as Iterable< any > ].sort( compare )
    ) as L;
  }

  public static sortKeysDeep < T > ( value: T, exclude: ReadonlySet< string > = new Set() ) : T {
    if ( value === null || typeof value !== 'object' ) return value;
    if ( Array.isArray( value ) ) return value.map( v => Utils.sortKeysDeep( v, exclude ) ) as any;

    return Object.keys( value )
      .sort( ( a, b ) => exclude.has( a ) || exclude.has( b ) ? 0 : a.localeCompare( b ) )
      .reduce( ( acc, k ) => {
        acc[ k ] = Utils.sortKeysDeep( ( value as any )[ k ], exclude );
        return acc;
      }, {} as any );
  }

  // --- merging ---

  public static merge < T > ( mode: ArrayMode, ...objects: any[] ) : T {
    return ( Utils.mergeInstances[ mode ] ??= new Merger( { arrayMode: mode } ) ).merge< T >(
      objects[ 0 ] ?? {} as T, ...objects.slice( 1 )
    ) as T;
  }

  public static unique < T = unknown > ( arr: T[] ) : T[] {
    return [ ...new Set( arr.map( item => JSON.stringify( item ) ) ) ].map( item => JSON.parse( item ) );
  }

  public static mergeArray < T = unknown > ( target: T[], source: T[], mode: ArrayMode = ArrayMode.Unique ) : T[] {
    switch ( mode ) {
      case ArrayMode.Replace: return source;
      case ArrayMode.Keep: return target;
      case ArrayMode.Concat: return [ ...target, ...source ];
      case ArrayMode.Unique: return Utils.unique< T >( [ ...target, ...source ] );
    }
  }

  // --- queries ---

  public static queryStr ( query: Record< string, any > ) : string {
    return new URLSearchParams( query ).toString();
  }

  // --- search index ---

  public static buildSearchText ( value: unknown, minLength: number = 4 ) : string {
    return [ ...new Set( String( value )
      .normalize( 'NFD' ).replace( REGEX_DIACRITICS, '' )
      .toLowerCase().replace( REGEX_NOALNUM, ' ' ).split( ' ' )
      .filter( w => w.length >= minLength ).filter( Boolean )
    ) ].join( ' ' );
  }

  public static tokenSearch ( text: string, tokens: string[], looseMatch: boolean = false ) : boolean {
    if ( ! text || ! tokens.length ) return false;
    return tokens[ looseMatch ? 'some' : 'every' ]( t => text.includes( t ) );
  }
}
