import type { TFilterList } from '@rtbnext/schema/src/model/filter';

import { Job } from '@/abstract/Job';
import { StatsGroup } from '@/lib/const';
import { Filter } from '@/model/Filter';
import { Profile } from '@/model/Profile';
import { ProfileIndex } from '@/model/ProfileIndex';
import { Stats } from '@/model/Stats';
import type { TJobClsOptions, TJobCommand } from '@/type/job';


export class StatsJob extends Job {
  private static readonly filter = Filter.getInstance();
  private static readonly index = ProfileIndex.getInstance();
  private static readonly stats = Stats.getInstance();

  constructor ( options: TJobClsOptions ) { super( options, 'stats' ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {
      const date = StatsJob.stats.getGlobalStats().date;
      if ( ! date || ! StatsJob.index.size ) throw new Error( 'No data available' );

      this.log( `Generating stats for ${ date } with ${ StatsJob.index.size } profiles` );
      const filter: Partial< TFilterList > = {}, stats: any = {};

      for ( const item of StatsJob.index.values ) {
        const profile = Profile.getByItem( item );
        if ( ! profile ) continue;

        const data = profile.getData();
        Stats.aggregate( data, date, stats );
        Filter.aggregate( data, filter );
      }

      this.log( `Saving stats for ${ date }` );
      StatsJob.filter.save( filter );
      StatsJob.stats.setProfileStats( stats.profile );
      StatsJob.stats.generateWealthStats( stats.scatter );
      StatsGroup.forEach( g => StatsJob.stats.setGroupedStats( g, stats.groups[ g ] ) );
      StatsJob.stats.setScatter( stats.scatter );
      StatsJob.stats.generateDBStats();
    } );
  }

  // --- command definition ---

  public static readonly command: TJobCommand = {
    id: 'stats',
    desc: 'Generate stats and filtered lists',
    options: []
  } as const;
}
