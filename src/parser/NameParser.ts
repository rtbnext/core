import { REGEX_FAMILY, REGEX_GROUP, REGEX_LOWER_START, REGEX_NAME_TRIM, REGEX_SPACE_DELIMITER, REGEX_SPACES, REGEX_SUFFIX } from '@/lib/regex';
import { Parser } from '@/parser/Parser';
import type { TFirstLastName, TNameResult, TSuffix } from '@/type/parser';


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

  private static group ( value: string, family: boolean ) : TNameResult {
    return { family, name: {
      fullName: value + ( family ? ' & family' : '' ),
      shortName: value, firstName: '', lastName: value
    } };
  }

  private static validate ( clean: string, fN: string, lN: string ) : TFirstLastName {
    const valid = ( part: string ) => !! part && clean.toLowerCase().includes( part.toLowerCase() );

    if ( fN && ! valid( fN ) ) fN = '';
    if ( lN && ! valid( lN ) ) lN = '';
    if ( fN && lN && fN.toLowerCase() === lN.toLowerCase() ) fN = '', lN = '';

    return { firstName: fN, lastName: lN };
  }

  private static detect ( parts: string[], asianFormat: boolean ) : TFirstLastName {
    if ( parts.length === 1 ) return { firstName: '', lastName: parts[ 0 ] };
    if ( asianFormat ) return { firstName: parts.slice( 1 ).join( ' ' ), lastName: parts[ 0 ] };
    if ( REGEX_LOWER_START.test( parts[ 0 ] ) ) return { firstName: '', lastName: parts.join( ' ' ) };

    let split = parts.length - 1;
    if ( parts.length > 2 && REGEX_SUFFIX.test( parts.at( -1 ) ?? '' ) ) split--;
    while ( split > 0 && REGEX_LOWER_START.test( parts[ split - 1 ] ) ) split--;

    return {
      firstName: parts.slice( 0, split ).join( ' ' ),
      lastName: parts.slice( split ).join( ' ' )
    };
  }

  private static fixLastName ( parts: string[], fN: string, lN: string ) : TFirstLastName {
    if ( ! fN && lN && parts.length > 1 ) {
      const lastParts = lN.split( REGEX_SPACE_DELIMITER );
      const size = lastParts.length;

      for ( let i = 0; i <= parts.length - size; i++ ) if (
        parts.slice( i, i + size ).join( ' ' ).toLowerCase() ===
        lN.toLowerCase()
      ) {
        fN = parts.slice( 0, i ).join( ' ' );
        lN = parts.slice( i ).join( ' ' );

        break;
      }
    }

    return { firstName: fN, lastName: lN };
  }

  private static splitSuffix ( lastName: string ) : TSuffix {
    const parts = lastName.split( REGEX_SPACE_DELIMITER );
    const suffix = parts.at( -1 ) ?? '';

    if ( ! REGEX_SUFFIX.test( suffix ) ) return { lastName, suffix: '' };
    return { lastName: parts.slice( 0, -1 ).join( ' ' ), suffix };
  }

  private static result ( clean: string, family: boolean, fN: string, lN: string, asianFormat: boolean ) : TNameResult {
    const { lastName, suffix } = this.splitSuffix( lN );

    return { family, name: {
      fullName: clean + ( family ? ' & family' : '' ), firstName: fN, lastName,
      shortName: ( asianFormat
        ? [ lastName, fN.split( ' ' )[ 0 ], suffix ]
        : [ fN.split( ' ' )[ 0 ], lastName, suffix ]
      ).filter( Boolean ).join( ' ' )
    } };
  }

  public static parse (
    value: unknown, lastName: unknown = undefined, firstName: unknown = undefined,
    asianFormat: boolean = false
  ) : TNameResult {
    const raw = this.normalize( value );
    const family = REGEX_FAMILY.test( raw );
    const clean = this.dedup( this.cleanName( raw ) );

    if ( REGEX_GROUP.test( clean ) ) return this.group( clean, family );

    const parts = clean.split( REGEX_SPACE_DELIMITER ).filter( Boolean );
    let fN = Parser.string( firstName );
    let lN = Parser.string( lastName ).replace( REGEX_FAMILY, '' );

    ( { firstName: fN, lastName: lN } = this.validate( clean, fN, lN ) );
    if ( ! fN && ! lN ) ( { firstName: fN, lastName: lN } = this.detect( parts, asianFormat ) );
    ( { firstName: fN, lastName: lN } = this.fixLastName( parts, fN, lN ) );

    return this.result( clean, family, fN, lN, asianFormat );
  }
}
