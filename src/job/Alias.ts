import { Job } from '@/abstract/Job';
import type { TAliasJobOptions, TCommandJob } from '@/type/job';


export class AliasJob extends Job< TAliasJobOptions > {
  constructor ( options: TAliasJobOptions ) { super( options, 'alias' ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {} );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'alias',
    desc: 'Manage profile aliases',
    options: []
  } as const;
}
