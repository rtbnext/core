import type { TMetaData } from '@rtbnext/schema/src/base/generic';
import { sha256 } from 'js-sha256';
import { hrtime } from 'node:process';

import { REGEX_NOALNUM } from '@/lib/regex';
import { Parser } from '@/parser/Parser';
import type { TMeasuredResult } from '@/type/generic';
import type { TParserDateType } from '@/type/parser';


export class Utils {
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

  public static async measure<
    F extends ( ...args: any[] ) => any,
    R = Awaited< ReturnType< F > >
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

  public static metaData < T extends Record< string, any > > ( obj?: T ) : TMetaData {
    return { $metadata: { schemaVersion: 2, lastModified: Utils.date( 'iso' ), ...obj } };
  }

  // --- URI component ---

  public static decodeURI ( value: unknown ) : string {
    return decodeURIComponent( Parser.string( value ) );
  }

  public static encodeURI ( value: unknown ) : string {
    return encodeURIComponent( Parser.string( value ) );
  }
}
