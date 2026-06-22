import { Job } from '@/abstract/Job';
import { Filter } from '@/model/Filter';
import { ProfileIndex } from '@/model/ProfileIndex';
import { Stats } from '@/model/Stats';
import type { TJobClsOptions, TJobDefinition } from '@/type/job';


export class StatsJob extends Job {
  private readonly filter = Filter.getInstance();
  private readonly stats = Stats.getInstance();

  constructor ( options: TJobClsOptions ) { super( options, 'stats' ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {
      const date = this.stats.getGlobalStats().date;
      const index = ProfileIndex.getInstance().getIndex();
      if ( ! date || ! index.size ) throw new Error( `No data available` );
    } );
  }

  // --- command definition ---

  public static readonly definition: TJobDefinition = {
    id: 'stats',
    desc: 'Generate stats and filtered lists',
    options: []
  } as const;
}
