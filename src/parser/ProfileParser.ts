import type { TProfileName } from '@rtbnext/schema/src/model/profile';

import { Cache } from '@/abstract/Cache';
import { Utils } from '@/core/Utils';
import type { IProfileParser } from '@/interface/parser';
import { REGEX_FAMILY, REGEX_SPACE_DELIMITER } from '@/lib/regex';
import { Parser } from '@/parser/Parser';
import type { TProfileResponse } from '@/type/response';


export class ProfileParser extends Cache implements IProfileParser {
  private readonly raw: TProfileResponse[ 'person' ];
  private readonly lists: TProfileResponse[ 'person' ][ 'personLists' ];

  constructor ( res: TProfileResponse ) {
    super();

    this.raw = res.person;
    this.lists = res.person.personLists.sort( ( a, b ) => Number( b.date ?? 0 ) - Number( a.date ?? 0 ) );
  }

  // --- raw data ---

  public rawData () : TProfileResponse[ 'person' ] {
    return this.raw;
  }

  public sortedLists () : TProfileResponse[ 'person' ][ 'personLists' ] {
    return this.lists;
  }

  // --- URIs & IDs ---

  public uri () : string {
    return this.cache( 'uri', () => Utils.sanitize( this.raw.uri ) );
  }

  public id () : string {
    return this.cache( 'id', () => Utils.hash( this.raw.naturalId ) );
  }

  public aliases () : string[] {
    return this.cache( 'aliases', () => {
      const uri = this.uri();

      return this.raw.uris.filter( Boolean ).map( i => Utils.sanitize( i ) )
        .filter( i => i !== uri ).sort();
    } );
  }

  // --- static methods ---

  public static name (
    value: unknown, lastName: unknown = undefined, firstName: unknown = undefined,
    asianFormat: boolean = false
  ) : { name: TProfileName, family: boolean } {
    const name = Parser.string( value );
    const clean = name.replace( REGEX_FAMILY, '' ).trim();
    const family = REGEX_FAMILY.test( name );
    const parts = clean.split( REGEX_SPACE_DELIMITER ).filter( Boolean );

    const fN = firstName ? Parser.string( firstName ) : (
      asianFormat ? parts.slice( 1 ).join( ' ' ) : parts.slice( 0, -1 ).join( ' ' )
    );
    const lN = lastName ? Parser.string( lastName ).replace( REGEX_FAMILY, '' ) : (
      asianFormat ? parts[ 0 ] || '' : parts.pop() || ''
    );

    return { family, name: {
      fullName: clean + ( family ? ' & family' : '' ),
      shortName: `${ fN.split( ' ' )[ 0 ] } ${ lN }`.trim(),
      lastName: lN, firstName: fN
    } };
  }
}
