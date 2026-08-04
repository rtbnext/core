import { Job } from '@/abstract/Job';
import type { TJobClsOptions } from '@/type/job';


export class SchedulerJob extends Job {
  constructor ( options: TJobClsOptions = {} ) { super( options, 'scheduler', [ 'system' ] ) }
}
