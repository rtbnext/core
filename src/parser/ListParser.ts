import type { TPersonListItem, TRTBListItem } from '@rtbnext/schema/src/model/list';

import { Cache } from '@/abstract/Cache';
import type { IListParser } from '@/interface/parser';


export class ListParser< T extends object > extends Cache implements IListParser< T > {
  protected static readonly FILTERABLE = new Set< string >( [
    'industry', 'gender', 'citizenship', 'place.country', 'place.state',
    'selfMadeRank', 'philanthropyScore', 'flag'
  ] );

  constructor ( protected readonly raw: T ) { super() }
  public rawData () : T { return this.raw }

  // --- columns / filters ---

  public static columns ( list: ( TPersonListItem | TRTBListItem )[] ) : string[] {
    const columns = new Set< string >();

    const collect = ( value: unknown, prefix = '' ) : void => {
      if ( value === undefined || value === null ) return;

      if ( typeof value !== 'object' || Array.isArray( value ) ) {
        if ( prefix ) columns.add( prefix );
        return;
      }

      for ( const [ key, child ] of Object.entries( value ) )
        collect( child, prefix ? `${ prefix }.${ key }` : key );
    };

    for ( const item of list ) collect( item );
    return [ ...columns ];
  }

  public static filters ( columns: string[] ) : string[] {
    return columns.filter( c => ListParser.FILTERABLE.has( c ) );
  }
}
