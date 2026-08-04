import { Job } from '@/abstract/Job';
import { ListQueue, ProfileQueue } from '@/core/Queue';
import type { TJobClsOptions } from '@/type/job';


export class SchedulerJob extends Job {
  private static readonly profileQueue = ProfileQueue.getInstance();
  private static readonly listQueue = ListQueue.getInstance();

  constructor ( options: TJobClsOptions = {} ) { super( options, 'scheduler', [ 'system' ] ) }
}
