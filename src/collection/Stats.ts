import { Storage } from '@/core/Storage';
import { TRealtimeStats } from '@/types/stats';

export class Stats {

    private static instance: Stats;
    private readonly storage: Storage;
    private realtime: TRealtimeStats;

    private constructor () {
        this.storage = Storage.getInstance();
        this.realtime = this.loadRealtimeStats();
    }

    private loadRealtimeStats () : TRealtimeStats {
        return this.storage.readJSON< TRealtimeStats >( 'stats/rt.json' ) || {} as TRealtimeStats;
    }

    public rt () : TRealtimeStats {
        return this.realtime;
    }

    public static getInstance () : Stats {
        return Stats.instance ||= new Stats();
    }

}
