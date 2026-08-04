import { Job } from '@/abstract/Job';
import { ListQueue, ProfileQueue } from '@/core/Queue';
import type { TCommandJob, TJobClsOptions } from '@/type/job';


export class SchedulerJob extends Job {
  private static readonly profileQueue = ProfileQueue.getInstance();
  private static readonly listQueue = ListQueue.getInstance();

  constructor ( options: TJobClsOptions = {} ) { super( options, 'scheduler', [ 'system' ] ) }

  // --- job runner ---

  public override async run() : Promise< void > {}

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'scheduler',
    desc: 'Processes either the profile or list queue, depends on workload'
  } as const;
}
