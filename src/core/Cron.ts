import { Storage } from '@/core/Storage';


export class Cron {
  private static readonly storage = Storage.getInstance();

  private readonly now: Date;
  private readonly lastRun: Date | false;

  constructor () {
    this.now = new Date();
    this.lastRun = this.getLastRun();
  }

  private getLastRun () : Date | false {
    const lastRun = Cron.storage.readJSON< { lastRun: string } >( 'cron.json' );
    return lastRun && lastRun.lastRun ? new Date( lastRun.lastRun ) : false;
  }
}
