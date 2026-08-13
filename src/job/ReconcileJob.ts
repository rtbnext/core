import { Job } from '@/abstract/Job';
import { ProfileIndex } from '@/model/ProfileIndex';
import { TJobClsOptions } from '@/type/job';


export class ReconcileJob extends Job {
  private static index = ProfileIndex.getInstance();
  constructor ( options: TJobClsOptions = {} ) { super( options, 'reconcile', [ 'profile', 'system' ] ) }
}
