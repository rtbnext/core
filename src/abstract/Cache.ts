import type { ICache } from '@/interface/cache';


export abstract class Cache< K extends string, T = unknown > implements ICache< K, T > {
  protected cachedData: Map< K, T > = new Map();

  protected cache ( key: K, fn: () => T ) : T {
    if ( ! this.cachedData.has( key ) ) this.cachedData.set( key, fn() );
    return this.cachedData.get( key )!;
  }

  public get size () : number {
    return this.cachedData.size;
  }

  public get ( key: K ) : T | undefined {
    return this.cachedData.get( key );
  }

  public has ( key: K ) : boolean {
    return this.cachedData.has( key );
  }

  public clear () : void {
    this.cachedData.clear();
  }
}
