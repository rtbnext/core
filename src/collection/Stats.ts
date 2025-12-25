import { Storage } from '@/core/Storage';
import { TRealtimeStats } from '@/types/stats';

export class Stats {

    private static instance: Stats;
    private readonly storage: Storage;
    private data: Record< string, any > = {};

    private constructor () {
        this.storage = Storage.getInstance();
    }

    public getRealtime () : TRealtimeStats {
        return this.data.rt ||= this.storage.readJSON< TRealtimeStats >( 'stats/rt.json' ) || {};
    }

    public setRealtime ( rt: TRealtimeStats ) : boolean {
        return this.storage.writeJSON< TRealtimeStats >( 'stats/rt.json', rt );
    }

    public static getInstance () : Stats {
        return Stats.instance ||= new Stats();
    }

}
