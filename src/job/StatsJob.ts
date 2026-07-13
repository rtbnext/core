import type { TFilterList } from '@rtbnext/schema/src/model/filter';

import { Job } from '@/abstract/Job';
import { ProfileQueue } from '@/core/Queue';
import { StatsGroup } from '@/lib/const';
import { Filter } from '@/model/Filter';
import { Profile } from '@/model/Profile';
import { ProfileIndex } from '@/model/ProfileIndex';
import { Stats } from '@/model/Stats';
import type { TCommandJob, TCronJob, TJobClsOptions } from '@/type/job';


export class StatsJob extends Job {
  private static readonly filter = Filter.getInstance();
  private static readonly index = ProfileIndex.getInstance();
  private static readonly queue = ProfileQueue.getInstance();
  private static readonly stats = Stats.getInstance();

  constructor ( options: TJobClsOptions = {} ) { super( options, 'stats', [ 'filter', 'stats' ] ) }

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

        // --- if profile data is missing, skip and add to queue for re-fetching ---
        if ( profile.check().missingFiles?.includes( 'profile.json' ) ) {
          this.log( `Invalid profile skipped: ${ item.uri }`, undefined, 'warn' );
          StatsJob.queue.add( { uriLike: item.uri, prio: 10 } );
          continue;
        }

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

  public static readonly command: TCommandJob = {
    id: 'stats',
    desc: 'Generate stats and filtered lists'
  } as const;
  
  // --- cron job definition ---

  public static readonly cron: TCronJob = [ {
    cronexpr: '5 */4 * * *', // run at 5 minutes past every 4th hour
  } ] as const;
}
