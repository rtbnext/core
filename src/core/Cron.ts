import { prev } from 'nxtcron';

import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import type { ICron } from '@/interface/cron';
import { JOBS } from '@/job/index';
import type { TCronConfig } from '@/type/config';
import { TScheduledJob } from '@/type/job';


export class Cron implements ICron {
  private static readonly storage = Storage.getInstance();
  private static instance: ICron;

  private readonly path = 'system/cron.json';
  private readonly config: TCronConfig;

  private constructor () {
    this.config = Config.getInstance().cron;
  }

  // --- helper ---

  private getLastRun () : Date | undefined {
    const lastRun = Cron.storage.readJSON< { lastRun: string } >( this.path );
    return lastRun && lastRun.lastRun ? new Date( lastRun.lastRun ) : undefined;
  }

  private setLastRun ( date: Date ) : boolean {
    return Cron.storage.writeJSON( this.path, { lastRun: date.toISOString() } );
  }

  private ensureLastRun () : Date | never {
    const lastRun = this.getLastRun();
    if ( lastRun instanceof Date && ! Number.isNaN( lastRun.getTime() ) ) return lastRun;

    this.setLastRun( new Date() );
    throw new Error( 'Initial Cron job run - will not execute any scheduled events' );
  }

  // --- determine jobs to run since last execution ---

  private schedule () : { before: Date, after: Date, jobs: TScheduledJob[] } {
    const lastRun = this.ensureLastRun();
    const after = new Date( Math.max( 0, lastRun.getTime() - this.config.jitter ) );
    const before = new Date();

    const cronOptions = { timezone: this.config.timezone, count: 1, after, before };
    const jobs: TScheduledJob[] = [];

    for ( const JobClass of JOBS ) {
      if ( ! ( 'cron' in JobClass ) ) continue;

      for ( const { cronexpr, options } of JobClass.cron ) {
        const [ date ] = prev( cronexpr, cronOptions );
        if ( ! ( date instanceof Date ) ) continue;

        jobs.push( { JobClass, date, options: options?.( date ) ?? {} } );
        break;
      }
    }

    log.debug( `Found ${ jobs.length } scheduled Cron jobs between ${ after.toISOString() } and ${ before.toISOString() }` );
    return { before, after, jobs: jobs.sort( ( a, b ) => a.date.getTime() - b.date.getTime() ) };
  }

  // --- cron runner ---

  public async run () : Promise< void > {
    await log.catchAsync( async () => {
      log.debug( 'Run scheduled Cron jobs ...' );
      const { before, jobs } = this.schedule();

      for ( const { JobClass, date, options } of jobs ) {
        log.debug( `Run Cron job [${ JobClass.command.id.toUpperCase() }] scheduled for ${ date.toISOString() }` );
        await new JobClass( options ).run();
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

export const run = () => Cron.getInstance().run();
