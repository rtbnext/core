import { Cache } from '@/abstract/Cache';
import { Utils } from '@/core/Utils';
import type { IListParser } from '@/interface/parser';


export class ListParser< T extends object > extends Cache implements IListParser< T > {
  constructor ( private readonly raw: T ) { super() }

  // --- helper ---

  public proceed < R > ( key: string, fn: ( val: any ) => R ) : R {
    if ( ! ( key in this.raw ) ) throw new Error( `Key "${ key }" not found in raw data` );
    return fn( this.raw[ key as keyof T ] );
  }

  // --- raw data ---

  public rawData () : T {
    return this.raw;
  }

  // --- URIs & IDs ---

  public uri () : string {
    return this.proceed( 'uri', ( val: string ) => this.cache( 'uri', () => Utils.sanitize( val ) ) );
  }

  public id () : string {
    return this.proceed( 'id', ( val: string ) => this.cache( 'id', () => Utils.hash( val ) ) );
  }
}
