import { Storage } from '@/core/Storage';
import { IStats } from '@/interfaces/stats';

export class Stats implements IStats {

    private static readonly storage = Storage.getInstance();
    private static instance: Stats;

    private constructor () {}

    public static getInstance () : Stats {
        return Stats.instance ||= new Stats();
    }

}
