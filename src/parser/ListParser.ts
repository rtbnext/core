import { Cache } from '@/abstract/Cache';
import type { IListParser } from '@/interface/parser';
import type { TListResponse, TResponse } from '@/type/response';


export class ListParser< T extends object > extends Cache implements IListParser< T > {
  constructor ( protected readonly raw: T ) { super() }
  public rawData () : T { return this.raw }

  // --- prepare raw list data ---

  public static prepareList < T extends object > ( res: TResponse< TListResponse< T > > ) {
    if ( ! res?.success || ! res.data ) throw new Error( 'Response does not contain valid list data' );

    const rawList = res.data.personList.personsLists;
    const entries = rawList.filter( ( i: any ) => ( i.rank || i.position ) && i.finalWorth ).filter( Boolean )
      .sort( ( a: any, b: any ) => ( a.rank || a.position ) - ( b.rank || b.position ) );

    return { rawData: res.data, rawList, entries };
  }
}
