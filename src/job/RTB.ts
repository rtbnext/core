import { Job } from '@/abstract/Job';
import type { TJobClsOptions, TJobDefinition } from '@/type/job';


export class RTBJob extends Job {
  constructor ( options: TJobClsOptions ) { super( options, 'rtb' ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {} );
  }

  // --- command definition ---

  public static readonly definition: TJobDefinition = {
    id: 'rtb',
    desc: 'Proceed daily real-time billionaires list',
    options: []
  } as const;
}
