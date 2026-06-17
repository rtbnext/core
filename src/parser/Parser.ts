import { REGEX_SPACES } from '@/lib/regex';
import type { TParserDateType } from '@/type/parser';


export class Parser {
  public static string ( value: unknown ) : string {
    return String( value ).trim().replace( REGEX_SPACES, ' ' );
  }

  public static safeStr ( value: unknown, allowedTags?: string[] ) : string {
    return Parser.string( value ).replace( new RegExp( allowedTags?.length
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
}
