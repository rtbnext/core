import { Cache } from '@/abstract/Cache';
import type { IListParser } from '@/interface/parser';
import type { TPersonListEntry } from '@/type/response';


export class ListParser< T extends object > extends Cache implements IListParser< T > {
  constructor ( private readonly raw: T ) { super() }
  public rawData () : T { return this.raw }
}

export class PersonListParser extends ListParser< TPersonListEntry > {

}
