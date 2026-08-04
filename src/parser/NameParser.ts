import { REGEX_FAMILY, REGEX_NAME_TRIM, REGEX_SPACE_DELIMITER, REGEX_SPACES } from '@/lib/regex';
import { Parser } from '@/parser/Parser';
import type { TNameResult } from '@/type/parser';


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

  public static parse ( value: unknown, lastName: unknown = undefined, firstName: unknown = undefined, asianFormat: boolean = false ) : TNameResult {}
}
