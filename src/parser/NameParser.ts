import { REGEX_FAMILY, REGEX_GROUP, REGEX_LOWER_START, REGEX_NAME_TRIM, REGEX_SPACE_DELIMITER, REGEX_SPACES } from '@/lib/regex';
import { Parser } from '@/parser/Parser';
import type { TNameResult } from '@/type/parser';
import { TProfileName } from '@rtbnext/schema/src/model/profile';


export class NameParser {
  private static normalize ( value: unknown ) : string {
    return Parser.string( value ).replace( REGEX_NAME_TRIM, '' ).replace( REGEX_SPACES, ' ' ).trim();
  }

  private static cleanName ( value: string ) : string {
    return value.replace( REGEX_FAMILY, '' ).replace( /^and\s+/i, '' ).trim();
  }

  private static dedup ( value: string ) : string {
    const parts = value.split( REGEX_SPACE_DELIMITER );
    return parts.length === 2 && parts[ 0 ].toLowerCase() === parts[ 1 ].toLowerCase() ? parts[ 0 ] : value;
  }

  private static isGroup ( value: string ) : boolean {
    return REGEX_GROUP.test( value );
  }

  private static group ( value: string, family: boolean ) : TNameResult {
    return { family, name: {
      fullName: value + ( family ? ' & family' : '' ),
      shortName: value, firstName: '', lastName: value
    } };
  }

  private static validate ( clean: string, fN: string, lN: string ) : Pick< TProfileName, 'firstName' | 'lastName' > {
    const valid = ( part: string ) => !! part && clean.toLowerCase().includes( part.toLowerCase() );

    if ( fN && !valid( fN ) ) fN = '';
    if ( lN && !valid( lN ) ) lN = '';
    if ( fN && lN && fN.toLowerCase() === lN.toLowerCase() ) fN = '', lN = '';

    return { firstName: fN, lastName: lN };
  }

  private static detect ( parts: string[], asianFormat: boolean ) : Pick< TProfileName, 'firstName' | 'lastName' > {
    if ( parts.length === 1 ) return { firstName: '', lastName: parts[ 0 ] };
    if ( asianFormat ) return { firstName: parts.slice( 1 ).join( ' ' ), lastName: parts[ 0 ] };
    if ( REGEX_LOWER_START.test( parts[ 0 ] ) ) return { firstName: '', lastName: parts.join( ' ' ) };

    let split = parts.length - 1;
    while ( split > 0 && REGEX_LOWER_START.test( parts[ split - 1 ] ) ) split--;

    return {
      firstName: parts.slice( 0, split ).join( ' ' ),
      lastName: parts.slice( split ).join( ' ' )
    };
  }

  private static fixLastName ( parts: string[], fN: string, lN: string ) : Pick< TProfileName, 'firstName' | 'lastName' > {
    if ( !fN && lN && parts.length > 1 ) {
      const index = parts.findIndex( part => part.toLowerCase() === lN.toLowerCase() );

      if ( index > 0 ) {
        fN = parts.slice( 0, index ).join( ' ' );
        lN = parts.slice( index ).join( ' ' );
      }
    }

    return { firstName: fN, lastName: lN };
  }

  public static parse ( value: unknown, lastName: unknown = undefined, firstName: unknown = undefined, asianFormat: boolean = false ) : TNameResult {
    const raw = this.normalize( value );
    const family = REGEX_FAMILY.test( raw );
    const clean = this.dedup( this.cleanName( raw ) );

    if ( this.isGroup( clean ) ) return this.group( clean, family );

    const parts = clean.split( REGEX_SPACE_DELIMITER ).filter( Boolean );
    let fN = Parser.string( firstName );
    let lN = Parser.string( lastName ).replace( REGEX_FAMILY, '' );

    ( { firstName: fN, lastName: lN } = this.validate( clean, fN, lN ) );

    if ( ! fN && ! lN ) ( { firstName: fN, lastName: lN } = this.detect( parts, asianFormat ) );

    ( { firstName: fN, lastName: lN } = this.fixLastName( parts, fN, lN ) );
  }
}
