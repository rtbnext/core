import { Job } from '@/abstract/Job';
import { ProfileIndex } from '@/model/ProfileIndex';
import type { TCommandJob, TJobClsOptions } from '@/type/job';


export class ReconcileJob extends Job {
  private static index = ProfileIndex.getInstance();
  constructor ( options: TJobClsOptions = {} ) { super( options, 'reconcile', [ 'profile', 'system' ] ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {} );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'reconcile',
    desc: 'Detect and resolve URI-alias conflicts'
  } as const;
}
