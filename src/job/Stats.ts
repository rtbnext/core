import { Job } from '@/abstract/Job';
import type { TJobDefinition } from '@/type/job';


export class StatsJob extends Job {

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {} );
  }

  // --- command definition ---

  public static readonly definition: TJobDefinition = {
    id: 'stats',
    desc: 'Generate stats and filtered lists',
    options: []
  } as const;
}
