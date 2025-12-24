import { Storage } from '@/core/Storage';
import { TGlobalStats } from '@/types/stats';

export class Stats {

    private static instance: Stats;
    private readonly storage: Storage;
    private globalStats: TGlobalStats;

    private constructor () {
        this.storage = Storage.getInstance();
        this.globalStats = this.loadGlobalStats();
    }

    private loadGlobalStats () : TGlobalStats {
        return this.storage.readJSON< TGlobalStats >( 'stats/global.json' ) || {} as TGlobalStats;
    }

    public global () : TGlobalStats {
        return this.globalStats;
    }

    public static getInstance () : Stats {
        return Stats.instance ||= new Stats();
    }

}
