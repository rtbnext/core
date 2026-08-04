import { REGEX_FAMILY, REGEX_NAME_TRIM, REGEX_SPACES } from '@/lib/regex';
import { Parser } from '@/parser/Parser';
import type { TNameResult } from '@/type/parser';


export class NameParser {
  private static normalize ( value: unknown ) : string {
    return Parser.string( value ).replace( REGEX_NAME_TRIM, '' ).replace( REGEX_SPACES, ' ' ).trim();
  }

  private static cleanName ( value: string ) : string {
    return value.replace( REGEX_FAMILY, '' ).replace( /^and\s+/i, '' ).trim();
  }

  public static parse ( value: unknown, lastName: unknown = undefined, firstName: unknown = undefined, asianFormat: boolean = false ) : TNameResult {}
}
