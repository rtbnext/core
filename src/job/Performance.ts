import { Job } from '@/abstract/Job';
import type { TJobClsOptions, TJobDefinition } from '@/type/job';


export class PerformanceJob extends Job {
  constructor ( options: TJobClsOptions ) { super( options, 'performance' ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {} );
  }

  // --- command definition ---

  public static readonly definition: TJobDefinition = {
    id: 'performance',
    desc: '',
    options: []
  } as const;
}
