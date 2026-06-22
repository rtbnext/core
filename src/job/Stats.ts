import type { TFilterList } from '@rtbnext/schema/src/model/filter';

import { Job } from '@/abstract/Job';
import { Filter } from '@/model/Filter';
import { Profile } from '@/model/Profile';
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

      this.log( `Generating stats for ${ date } with ${ index.size } profiles` );
      const filter: Partial< TFilterList > = {}, stats: any = {};

      for ( const item of index.values() ) {
        const profile = Profile.getByItem( item );
        if ( ! profile ) continue;

        const data = profile.getData();
        Stats.aggregate( data, date, stats );
        Filter.aggregate( data, filter );
      }
    } );
  }

  // --- command definition ---

  public static readonly definition: TJobDefinition = {
    id: 'stats',
    desc: 'Generate stats and filtered lists',
    options: []
  } as const;
}
