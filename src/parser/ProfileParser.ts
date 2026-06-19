import { Cache } from '@/abstract/Cache';
import { Utils } from '@/core/Utils';
import type { IProfileParser } from '@/interface/parser';
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
}
