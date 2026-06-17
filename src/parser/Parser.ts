import type { Primitive } from 'devtypes/types/primitive';

import { REGEX_SPACES } from '@/lib/regex';
import type { TParserContainer, TParserDateType, TParserMethod } from '@/type/parser';


export class Parser {
  // --- primitive ---

  public static primitive ( value: unknown, safe: boolean = true ) : Primitive {
    return value === null || value === undefined ? value
      : typeof value === 'boolean' ? value
      : ! isNaN( Number( value ) ) && value !== '' ? Parser.number( value )
      : safe ? Parser.safeStr( value ) : Parser.string( value );
  }

  public static string ( value: unknown ) : string {
    return String( value ).trim().replace( REGEX_SPACES, ' ' );
  }

  public static safeStr ( value: unknown, allowedTags?: string[] ) : string {
    return String( value ).replace( new RegExp( allowedTags?.length
      ? `<\\/?(?!(${ allowedTags.join( '|' ) })\\b)(\\w+)([^>]*)>` : '<[^>]*>', 'gi'
    ), '' ).replace( REGEX_SPACES, ' ' ).trim();
  }

  public static boolean ( value: unknown ) : boolean {
    return value !== null && value !== undefined && ( typeof value === 'boolean' ? value :
      [ '1', 'true', 'yes', 'y' ].includes( Parser.string( value ).toLowerCase() )
    );
  }

  public static number ( value: unknown, digits: number = 0 ) : number {
    return Number( Number( value ).toFixed( digits ) );
  }

  public static money ( value: unknown ) : number {
    return Parser.number( value, 3 );
  }

  public static pct ( value: unknown, digits: number = 2 ) : number {
    return Parser.number( value, digits );
  }

  public static date ( value?: any, format: TParserDateType = 'ymd' ) : string | undefined {
    try { value = new Date( value ).toISOString() } catch { return undefined }
    return format === 'iso' ? value : value.split( '-' ).slice( 0, format.length ).join( '-' );
  }

  // --- helper ---

  public static strict < T = unknown > ( value: unknown, method: TParserMethod, ...args: any[] ) : T | undefined {
    return value === null || value === undefined ? undefined : ( Parser[ method ] as any )( value, ...args ) as T;
  }

  public static list < T extends string | ( string | number | undefined )[] > (
    value: T | T[], type: TParserMethod = 'primitive', delimiter: string = ',',
    strict: boolean = true, ...args: any[]
  ) : T[] {
    return ( Array.isArray( value ) ? value : value.split( delimiter ) ).map(
      v => strict ? Parser.strict( v, type, ...( args || [] ) )
        : ( Parser[ type ] as any )( v, ...( args || [] ) )
    ).filter( Boolean ) as T[];
  }

  public static obj < T = unknown > (
    value: T, type: TParserMethod = 'primitive', strict: boolean = true, ...args: any[]
  ) : T {
    if ( typeof value !== 'object' || value === null ) return {} as T;

    return Object.fromEntries( Object.entries( value ).map( ( [ k, v ] ) => [
      k, strict ? Parser.strict( v, type, ...( args || [] ) )
        : ( Parser[ type ] as any )( v, ...( args || [] ) )
    ] ) ) as T;
  }

  public static map < T extends Primitive, L extends readonly T[] | Record< string | number, T > > (
    value: any, list: L, fb: T | undefined = undefined, exactMatch: boolean = false, useKey?: boolean
  ) : T | undefined {
    if ( useKey === undefined ) useKey = ! Array.isArray( list );
    value = Parser.string( value ).toLowerCase();

    return Object.entries( list ).find( ( [ k, v ] ) => {
      const test = Parser.string( useKey ? k : v ).toLowerCase();
      return exactMatch ? value === test : ( value.includes( test ) || test.includes( value ) );
    } )?.[ 1 ] || fb;
  }

  // --- container ---

  public static container < T = unknown > ( obj: { [ K in keyof T ]: TParserContainer } ) : T {
    return Object.fromEntries( Object.entries< TParserContainer >( obj ).map(
      ( [ key, { value, type, strict = true, args } ] ) => [
        key, type === 'container' ? value
          : strict ? Parser.strict( value, type, ...( args || [] ) )
          : ( Parser[ type ] as any )( value, ...( args || [] ) )
      ]
    ) ) as T;
  }
}
