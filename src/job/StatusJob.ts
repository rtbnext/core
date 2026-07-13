import { Job } from '@/abstract/Job';
import { Status } from '@/core/Status';
import type { TCommandJob, TCronJob, TStatusJobOptions } from '@/type/job';


export class StatusJob extends Job< TStatusJobOptions > {
  constructor ( options: TStatusJobOptions ) { super( options, 'status', [ 'system' ] ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {
      const status = Status.getInstance();

      if ( this.options.cleanup ) status.cleanup();
      else status.flush();
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'status',
    desc: 'Calculates services status from job logs',
    options: [ {
      name: '-c, --cleanup',
      desc: 'Cleanup status log, archive entries older than 3 months'
    } ]
  } as const;

  // --- cron job definition ---

  public static readonly cron: TCronJob< TStatusJobOptions > = [ {
    cronexpr: '5 0 1 * *', // run at 0:05 AM on the first day of every month
    options: () => ( { cleanup: true } )
  } ] as const;
}
