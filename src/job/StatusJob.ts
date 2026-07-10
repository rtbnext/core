import { Job } from '@/abstract/Job';
import { Status } from '@/core/Status';
import type { TCommandJob, TJobClsOptions } from '@/type/job';


export class StatusJob extends Job {
  constructor ( options: TJobClsOptions = {} ) { super( options, 'status', [] ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => Status.getInstance().flush() );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'status',
    desc: 'Calculates services status from job logs'
  } as const;
}
