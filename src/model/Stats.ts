import { Storage } from '@/core/Storage';
import type { IStats } from '@/interface/stats';


export class Stats implements IStats {
  private static readonly storage = Storage.getInstance();
  private static instance: IStats;
}
