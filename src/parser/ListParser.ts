import { Cache } from '@/abstract/Cache';
import type { IListParser } from '@/interface/parser';


export class ListParser< T extends object > extends Cache implements IListParser< T > {
  constructor ( protected readonly raw: T ) { super() }
  public rawData () : T { return this.raw }
}
