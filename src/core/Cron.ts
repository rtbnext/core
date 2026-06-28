import { Storage } from '@/core/Storage';
import { JOBS } from '@/job/index';


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

  private saveRunTime () : boolean {
    return Cron.storage.writeJSON( 'cron.json', { lastRun: this.now.toISOString() } );
  }

  private ensureLastRun () : boolean {
    if ( this.lastRun instanceof Date ) return true;

    this.saveRunTime();
    return false;
  }

  public run () : void {
    this.ensureLastRun();

    for ( const JobClass of JOBS ) {
      if ( ! ( 'cron' in JobClass ) ) continue;

      for ( const { cronexpr, options } of JobClass.cron ) {
        //
      }
    }
  }
}
