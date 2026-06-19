import type { ICache } from '@/interface/cache';


export abstract class Cache implements ICache {
  protected cachedData: Map< string, unknown > = new Map();

  protected cache < T = unknown > ( key: string, fn: () => T ) : T {
    if ( ! this.cachedData.has( key ) ) this.cachedData.set( key, fn() );
    return this.cachedData.get( key ) as T;
  }

  public get size () : number {
    return this.cachedData.size;
  }

  public get < T = unknown > ( key: string ) : T | undefined {
    return this.cachedData.get( key ) as T;
  }

  public has ( key: string ) : boolean {
    return this.cachedData.has( key );
  }

  public clear () : void {
    this.cachedData.clear();
  }
}
