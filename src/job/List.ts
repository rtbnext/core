import { Job } from '@/abstract/Job';
import type { TCommandJob, TCronJob, TJobClsOptions } from '@/type/job';


export class ListJob extends Job {
  constructor ( options: TJobClsOptions = {} ) { super( options, 'list' ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {} );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'list',
    desc: 'Fetch and process Forbes lists'
  } as const;

  // --- cron job definition ---

  public static readonly cron: TCronJob = [ {
    cronexpr: '*/15 1 * * *', // run every 15 minutes between 1:00 and 1:59 AM
  } ] as const;
}
