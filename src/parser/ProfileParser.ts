import type { TEducation, TSelfMade } from '@rtbnext/schema/src/base/generic';
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
      return this.raw.uris.filter( Boolean ).map( i => Utils.sanitize( i ) ).filter( i => i !== uri ).sort();
    } );
  }

  // --- profile parser ---

  public name () : { name: TProfileName, family: boolean } {
    return this.cache( 'name', () => ProfileParser.name(
      this.raw.name, this.raw.lastName, this.raw.firstName, Parser.boolean( this.raw.asianFormat )
    ) );
  }

  public citizenship () : string | undefined {
    return this.cache( 'citizenship', () => Parser.strict(
      this.raw.countryOfCitizenship || this.raw.countryOfResidence, 'country'
    ) );
  }

  public education () : TEducation[] {
    return this.cache( 'education', () => ( this.raw.educations ?? [] ).filter( Boolean ).map(
      item => Parser.container< TEducation >( {
        school: { value: item.school, type: 'string' },
        degree: { value: item.degree, type: 'string' }
      } )
    ) );
  }

  public selfMade () : TSelfMade {
    return this.cache( 'selfMade', () => Parser.container< TSelfMade >( {
      type: { value: this.raw.selfMadeType, type: 'string' },
      is: { value: this.raw.selfMade, type: 'boolean' },
      rank: { value: this.raw.selfMadeRank, type: 'number' }
    } ) );
  }

  public philanthropyScore () : number | undefined {
    return this.cache( 'philanthropyScore', () =>
      Utils.aggregate( this.lists, 'philanthropyScore', 'first' ) as number | undefined
    );
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
