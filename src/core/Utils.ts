import type { TMetaData } from '@rtbnext/schema/src/base/generic';

import { REGEX_NOALNUM } from '@/lib/regex';
import { Parser } from '@/parser/Parser';
import type { TParserDateType } from '@/type/parser';


export class Utils {
  // --- sanitize IDs and URIs ---

  public static sanitize ( value: unknown, delimiter: string = '-' ) : string {
    return Parser.string( value ).toLowerCase().replace( REGEX_NOALNUM, delimiter )
      .replace( new RegExp( `[${ delimiter }]{2,}`, 'g' ), delimiter );
  }

  public static date ( format: TParserDateType = 'ymd' ) : string {
    return Parser.date( undefined, format )!;
  }

  public static metaData < T extends Record< string, any > > ( obj?: T ) : TMetaData {
    return { $metadata: { schemaVersion: 2, lastModified: Utils.date( 'iso' ), ...obj } };
  }

  public static decodeURI ( value: unknown ) : string {
    return decodeURIComponent( Parser.string( value ) );
  }

  public static encodeURI ( value: unknown ) : string {
    return encodeURIComponent( Parser.string( value ) );
  }
}
