import { ICache } from '@/interfaces/cache';

export abstract class Cache implements ICache {

    protected cachedData: Map< string, any > = new Map();

    protected cache< T = any > ( key: string, fn: () => T ) : T {
        if ( ! this.cachedData.has( key ) ) this.cachedData.set( key, fn() );
        return this.cachedData.get( key );
    }

    public size () : number {
        return this.cachedData.size;
    }

    public get< T = any > ( key: string ) : T | undefined {
        return this.cachedData.get( key );
    }

    public has ( key: string ) : boolean {
        return this.cachedData.has( key );
    }

    public clear () : void {
        this.cachedData.clear();
    }

}
