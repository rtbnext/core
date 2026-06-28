import { prev } from 'nxtcron';

import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import type { ICron } from '@/interface/cron';
import { JOBS } from '@/job/index';
import type { TCronConfig } from '@/type/config';


export class Cron implements ICron {
  private static readonly storage = Storage.getInstance();
  private static instance: ICron;

  private readonly config: TCronConfig;

  private constructor () {
    this.config = Config.getInstance().cron;
  }

  // --- helper ---

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

  // --- cron runner ---

  public async run () : Promise< void > {
    await log.catchAsync( async () => {
      log.debug( 'Run scheduled Cron jobs ...' );

      const after = this.ensureLastRun(), before = new Date();
      const cronOptions = { timezone: this.config.timezone, count: 1, after, before };

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
