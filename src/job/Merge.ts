import { Job } from '@/abstract/Job';
import type { TMergeJobOptions } from '@/type/job';


export class MergeJob extends Job< TMergeJobOptions > {
  constructor ( options: TMergeJobOptions ) { super( options, 'merge' ) }

  public async run () : Promise< void > {
    await this.protect( async () => {
      const { list, source, target, dryRun, force, makeAlias } = this.options;
    } );
  }
}
