import { REGEX_SPACES } from '@/lib/regex';

export class Parser {
  public static string ( value: any ) : string {
    return String( value ).trim().replace( REGEX_SPACES, ' ' );
  }

  public static safeStr ( value: any, allowedTags?: string[] ) : string {
    return Parser.string( value ).replace( new RegExp( allowedTags?.length
      ? `<\\/?(?!(${ allowedTags.join( '|' ) })\\b)(\\w+)([^>]*)>` : '<[^>]*>', 'gi'
    ), '' ).replace( REGEX_SPACES, ' ' ).trim();
  }

  public static boolean ( value: any ) : boolean {
    return value !== null && value !== undefined && ( typeof value === 'boolean' ? value :
      [ '1', 'true', 'yes', 'y' ].includes( Parser.string( value ).toLowerCase() )
    );
  }
}
