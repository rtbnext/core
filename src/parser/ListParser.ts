import { Cache } from '@/abstract/Cache';
import { Utils } from '@/core/Utils';
import type { IListParser } from '@/interface/parser';


export class ListParser< T extends object > extends Cache implements IListParser< T > {
  constructor ( private readonly raw: T ) { super() }

  // --- helper ---

  public safeVal < R > ( key: string, def?: unknown ) : R | undefined {
    return ( key in this.raw ? this.raw[ key as keyof T ] : def ?? undefined ) as R;
  }

  // --- raw data ---

  public rawData () : T {
    return this.raw;
  }

  // --- URIs & IDs ---

  public uri () : string {
    return this.cache( 'uri', () => Utils.sanitize( this.safeVal< string >( 'uri' ) ) );
  }

  public id () : string {
    return this.cache( 'id', () => Utils.hash( this.safeVal< string >( 'naturalId' ) ) );
  }
}
