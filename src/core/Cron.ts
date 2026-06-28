import { prev } from 'nxtcron';

import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import type { ICron } from '@/interface/cron';
import { JOBS } from '@/job/index';


export class Cron implements ICron {
  private static readonly storage = Storage.getInstance();
  private static instance: ICron;

  private constructor () {}

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
      log.debug( 'Run scheduled Cron jobs ...' );

      const after = this.ensureLastRun(), before = new Date();
      const cronOptions = { after, before, count: 1, timezone: 'UTC' };

      for ( const JobClass of JOBS ) {
        if ( ! ( 'cron' in JobClass ) ) continue;

        for ( const { cronexpr, options } of JobClass.cron ) {
          const [ date ] = prev( cronexpr, cronOptions );
          if ( date === undefined || ! ( date instanceof Date ) ) continue;

          log.info( `[CRON] Run Cron job ${ JobClass.command.id } sheduled @ ${ date.toISOString() }` );
          await new JobClass( options?.( date ) ?? {} as any ).run();
          break;
        }
      }

      log.debug( `Shut down Cron job runner, set last run time to ${ before.toISOString() }` );
      this.setLastRun( before );
    }, 'Failed to run cron jobs' );
  }

  // --- instantiate ---

  public static getInstance () : ICron {
    return Cron.instance ??= new Cron();
  }
}
