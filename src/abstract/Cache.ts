import type { ICache } from '@/interface/cache';


export abstract class Cache< K extends string, T = unknown > implements ICache {
  protected cachedData: Map< K, T > = new Map();

  protected cache ( key: K, fn: () => T ) : T {
    if ( ! this.cachedData.has( key ) ) this.cachedData.set( key, fn() );
    return this.cachedData.get( key )!;
  }
}
