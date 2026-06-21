import { Job } from '@/abstract/Job';
import type { TJobClsOptions } from '@/type/job';


export class RTBJob extends Job {
  constructor ( options: TJobClsOptions ) { super( options, 'rtb' ) }
}
