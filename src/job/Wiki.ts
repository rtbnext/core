import { Job } from '@/abstract/Job';
import type { TWikiJobOptions } from '@/type/job';


export class WikiJob extends Job< TWikiJobOptions > {
  constructor ( options: TWikiJobOptions ) { super( options, 'Wiki' ) }
}
