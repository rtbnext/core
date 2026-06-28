import { prev } from 'nxtcron';

import { log } from '@/core/Logger';
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

  public async run () : Promise< void > {
    await log.catchAsync( async () => {
      this.ensureLastRun();
      const cronOptions = { after: this.lastRun as Date, before: this.now, count: 1, timezone: 'UTC' };

      for ( const JobClass of JOBS ) {
        if ( ! ( 'cron' in JobClass ) ) continue;

        for ( const { cronexpr, options } of JobClass.cron ) {
          const date = prev( cronexpr, cronOptions );
          if ( ! date.length || ! ( date[ 0 ] instanceof Date ) ) continue;

          log.info( `[CRON] Run cron job ${ JobClass.command.id } sheduled @ ${ date[ 0 ].toISOString() }` );
          await new JobClass( options?.( date[ 0 ] ) ?? {} as any ).run();
          break;
        }
      }
    }, 'Failed to run cron jobs' );
  }
}
