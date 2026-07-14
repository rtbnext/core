import type { TFilterList } from '@rtbnext/schema/src/model/filter';
import type { TSearchIndexItem } from '@rtbnext/schema/src/model/search';

import { Job } from '@/abstract/Job';
import { StatsGroup } from '@/lib/const';
import { Filter } from '@/model/Filter';
import { Profile } from '@/model/Profile';
import { ProfileIndex } from '@/model/ProfileIndex';
import { Search } from '@/model/Search';
import { Stats } from '@/model/Stats';
import type { TCommandJob, TCronJob, TJobClsOptions } from '@/type/job';


export class StatsJob extends Job {
  private static readonly index = ProfileIndex.getInstance();
  private static readonly filter = Filter.getInstance();
  private static readonly search = Search.getInstance();
  private static readonly stats = Stats.getInstance();

  constructor ( options: TJobClsOptions = {} ) { super( options, 'stats', [ 'filter', 'stats' ] ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {
      const date = StatsJob.stats.getGlobalStats().date;
      if ( ! date || ! StatsJob.index.size ) throw new Error( 'No data available' );

      this.log( `Generating stats for ${ date } with ${ StatsJob.index.size } profiles ...` );
      const filter: Partial< TFilterList > = {}, search: TSearchIndexItem[] = [], stats: any = {};

      for ( const item of StatsJob.index.values ) {
        const profile = Profile.getByItem( item );
        if ( ! profile ) continue;

        // --- skip unhealthy profiles ---
        if ( ! profile.healthy() ) {
          this.log( `Invalid profile skipped: ${ item.uri }`, undefined, 'warn' );
          continue;
        }

        const data = profile.getData();
        Filter.aggregate( data, filter );
        Search.aggregate( data, profile.getMeta(), search );
        Stats.aggregate( data, date, stats );
      }

      this.log( 'Saving aggregated filter lists and search index ...' );
      StatsJob.filter.save( filter );
      StatsJob.search.save( search );

      this.log( `Saving stats for ${ date } ...` );
      StatsJob.stats.setProfileStats( stats.profile );
      StatsJob.stats.generateWealthStats( stats.scatter );
      StatsGroup.forEach( g => StatsJob.stats.setGroupedStats( g, stats.groups[ g ] ) );
      StatsJob.stats.setScatter( stats.scatter );
      StatsJob.stats.generateDBStats();
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'stats',
    desc: 'Generate stats and filtered lists'
  } as const;
  
  // --- cron job definition ---

  public static readonly cron: TCronJob = [ {
    cronexpr: '5 */6 * * *', // run at 5 minutes past every 6th hour
  } ] as const;
}
