import type { TGender, TIndustry, TMaritalStatus } from '@rtbnext/schema/src/base/const';
import type { TLocation } from '@rtbnext/schema/src/base/generic';
import type { Primitive } from 'devtypes/types/primitive';
import countries from 'i18n-iso-countries';
import states from 'us-state-converter';

import { Gender, IndustryResolver, MaritalStatusResolver } from '@/lib/const';
import { REGEX_SPACES } from '@/lib/regex';
import type { TIndustryResolver, TMaritalStatusResolver } from '@/type/generic';
import type { TParserContainer, TParserDateType, TParserMethod } from '@/type/parser';


export class Parser {
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
    try { value = ( value ? new Date( value ) : new Date() ).toISOString() } catch { return undefined }
    return format === 'iso' ? value : value.split( 'T' )[ 0 ].split( '-' ).slice( 0, format.length ).join( '-' );
  }

  public static json ( value: unknown ) : any {
    if ( typeof value === 'object' ) return value;

    try { return JSON.parse( String( value ) ) }
    catch ( err ) { throw new SyntaxError( `Invalid JSON string: ${ value }` ) }
  }

  // --- URI component ---

  public static decodeURI ( value: unknown ) : string {
    return decodeURIComponent( Parser.string( value ) );
  }

  public static encodeURI ( value: unknown ) : string {
    return encodeURIComponent( Parser.string( value ) );
  }

  // --- profile ---

  public static age ( value: any ) : number | undefined {
    const date = new Date( value );
    return isNaN( date.getTime() ) ? undefined : new Date( Date.now() - date.getTime() ).getUTCFullYear() - 1970;
  }

  public static ageDecade ( value: any, min: number = 30, max: number = 90 ) : number | undefined {
    const age = Parser.age( value );
    return age === undefined ? undefined : Math.max( min, Math.min( max, Math.floor( age / 10 ) * 10 ) );
  }

  public static gender ( value: unknown ) : TGender | undefined {
    return Parser.map( value, Gender );
  }

  public static maritalStatus ( value: unknown ) : TMaritalStatus | undefined {
    return Parser.map< TMaritalStatus, TMaritalStatusResolver >( value, MaritalStatusResolver );
  }

  public static industry ( value: unknown ) : TIndustry {
    return Parser.map< TIndustry, TIndustryResolver >( value, IndustryResolver, 'diversified' )!;
  }

  // --- location ---

  public static country ( value: unknown ) : string | undefined {
    const code = countries.getAlpha2Code( Parser.string( value ), 'en' );
    return code ? code.toUpperCase() : undefined;
  }

  public static state ( value: unknown ) : string | undefined {
    return value ? ( states as any ).abbr( Parser.string( value ) ).toUpperCase() : undefined;
  }

  public static latLng ( lat: unknown, lng: unknown ) : [ number, number ] | undefined {
    const latitude = Parser.number( lat, 6 ), longitude = Parser.number( lng, 6 );
    return isNaN( latitude ) || isNaN( longitude ) ? undefined : [ latitude, longitude ];
  }

  public static location ( value: { country: unknown, state?: unknown, city?: unknown } ) : TLocation | undefined {
    const country = Parser.country( value.country );

    return country ? {
      country, state: Parser.state( value.state ),
      city: Parser.strict( value.city, 'string' )
    } : undefined;
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
