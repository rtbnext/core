import { Storage } from '@/core/Storage';


export class Cron {
  private static readonly storage = Storage.getInstance();

  private readonly now: Date;
  private readonly lastRun: Date;

  constructor () {
    this.now = new Date();
  }
}
