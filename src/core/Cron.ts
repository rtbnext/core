import { prev } from 'nxtcron';

import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { JOBS } from '@/job/index';


export class Cron {
  private static readonly storage = Storage.getInstance();
  private lastRun?: Date;

  private getLastRun () : Date | undefined {
    const lastRun = Cron.storage.readJSON< { lastRun: string } >( 'cron.json' );
    return lastRun && lastRun.lastRun ? new Date( lastRun.lastRun ) : undefined;
  }

  private setLastRun ( date: Date ) : boolean {
    return Cron.storage.writeJSON( 'cron.json', { lastRun: date.toISOString() } );
  }

  private ensureLastRun () : Date | never {
    const lastRun = this.getLastRun();
    if ( lastRun instanceof Date ) return lastRun;

    this.setLastRun( new Date() );
    throw new Error( 'Initial Cron job run - will not execute any scheduled events' );
  }

  public async run () : Promise< void > {
    await log.catchAsync( async () => {
      this.ensureLastRun();
      const cronOptions = { after: this.lastRun, before: this.now, count: 1, timezone: 'UTC' };

      for ( const JobClass of JOBS ) {
        if ( ! ( 'cron' in JobClass ) ) continue;

        for ( const { cronexpr, options } of JobClass.cron ) {
          const [ date ] = prev( cronexpr, cronOptions );
          if ( date === undefined || ! ( date instanceof Date ) ) continue;

          log.info( `[CRON] Run cron job ${ JobClass.command.id } sheduled @ ${ date.toISOString() }` );
          await new JobClass( options?.( date ) ?? {} as any ).run();
          break;
        }
      }
    }, 'Failed to run cron jobs' );
  }
}
