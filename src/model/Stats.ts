import { StatsGroup } from '@/core/Const';
import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { IStats } from '@/interfaces/stats';
import { TDBStats } from '@rtbnext/schema/src/model/stats';
import { join } from 'node:path';

export class Stats implements IStats {

    private static readonly storage = Storage.getInstance();
    private static instance: Stats;

    private constructor () {
        this.initDB();
    }

    private initDB () : void {
        log.debug( 'Initializing stats storage paths' );
        StatsGroup.forEach( group => Stats.storage.ensurePath( this.resolvePath( group ), true ) );
    }

    // Private helper

    private resolvePath ( path: string ) : string {
        return join( 'stats', path );
    }

    private getStats< T > ( path: string, format: 'json' | 'csv' ) : T {
        return ( ( Stats.storage[ format === 'csv' ? 'readCSV' : 'readJSON' ] as any )
            ( this.resolvePath( path ) ) || ( format === 'csv' ? [] : {} ) ) as T;
    }

    // Stats getter

    public getDBStats () : TDBStats {
        return this.getStats< TDBStats >( 'db.json', 'json' );
    }

    // Instantiate

    public static getInstance () : Stats {
        return Stats.instance ||= new Stats();
    }

}
