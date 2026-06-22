import { Cache } from '@/abstract/Cache';
import { Utils } from '@/core/Utils';
import type { IListParser } from '@/interface/parser';
import type { TPersonListEntry } from '@/type/response';


export class ListParser< T extends object > extends Cache implements IListParser< T > {
  constructor ( protected readonly raw: T ) { super() }
  public rawData () : T { return this.raw }
}

export class PersonListParser extends ListParser< TPersonListEntry > {
  public uri () : string {
    return this.cache( 'uri', () => Utils.sanitize( this.raw.uri ) );
  }

  public id () : string {
    return this.cache( 'id', () => Utils.hash( this.raw.naturalId ) );
  }
}
