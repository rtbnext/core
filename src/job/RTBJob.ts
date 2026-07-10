import type { TRTBListItem } from '@rtbnext/schema/src/model/list';

import { Job } from '@/abstract/Job';
import { Fetch } from '@/core/Fetch';
import { ProfileQueue } from '@/core/Queue';
import { LISTS } from '@/lib/list';
import { List } from '@/model/List';
import { Mover } from '@/model/Mover';
import { Profile } from '@/model/Profile';
import { ProfileIndex } from '@/model/ProfileIndex';
import { Stats } from '@/model/Stats';
import { Parser } from '@/parser/Parser';
import type { TCommandJob, TCronJob, TJobClsOptions } from '@/type/job';
import type { TQueueOptions } from '@/type/queue';
import type { TPersonListEntry } from '@/type/response';
import { Performance } from '@/util/Performance';
import { ProfileManager } from '@/util/ProfileManager';


export class RTBJob extends Job {
  private static readonly fetch = Fetch.getInstance();
  private static readonly mover = Mover.getInstance();
  private static readonly queue = ProfileQueue.getInstance();
  private static readonly stats = Stats.getInstance();

  constructor ( options: TJobClsOptions = {} ) { super( options, 'rtb', [ 'profile', 'list', 'mover', 'stats' ] ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {
      const res = await RTBJob.fetch.list< TPersonListEntry >( 'rtb', '0' );
      if ( ! res?.success || ! res.data ) throw new Error( 'Request failed' );

      const date = Parser.date( undefined, 'ymd' )!;
      const ts = new Date( date ).getTime();

      // --- if RTB list is already up to date, exit the job ---
      if ( RTBJob.stats.getGlobalStats().date === date ) {
        this.log( 'RTB list is already up to date' );
        return;
      }

      const { parser, indexItem, listItem } = LISTS.rtb;
      const th = Date.now() - Job.config.queue.tsThreshold;
      const { entries } = parser.prepareList( res );

      this.log( `Processing RTB list dated ${ date } (${ entries.length } items)` );

      // --- process list data ---
      let count = 0, total = 0, woman = 0;
      const items: TRTBListItem[] = [];
      const mover = Mover.factory( date );
      const queue: TQueueOptions[] = [];

      for ( const [ i, raw ] of Object.entries( entries ) ) {
        raw.date = ts;

        // --- parse raw list data ---
        const parsed = new parser( raw );
        const uri = parsed.uri();
        const id = parsed.id();
        const rank = parsed.rank();
        const networth = parsed.networth();

        if ( ! rank || ! networth ) {
          this.log( `Skipping invalid RTB entry for ${ uri }` );
          continue;
        }

        let profileData = Profile.factory( { uri, id, info: parsed.info(), bio: parsed.bio(), assets: parsed.assets() } );

        // --- process profile using ProfileManager ---
        const { profile, action } = ProfileManager.process( uri, id, profileData, 'updateData' ) || {};

        if ( ! profile || ! action ) this.log( `Failed to process profile for ${ uri }`, undefined, 'warn' );
        else {
          ProfileManager.updateQueue( queue, profile, action, th );
          profileData = profile.getData();
        }

        // --- process realtime data ---
        const prev = entries[ Number( i ) - 1 ]?.uri;
        const next = entries[ Number( i ) + 1 ]?.uri;
        const realtime = parsed.realtime( profileData, prev, next );
        const { flag, rankDiff } = parsed.rankDiff( profileData );
        const { value = 0, percent = 0 } = realtime?.today ?? {};

        // --- update profile data ---
        if ( profile ) {
          profile.addHistory( [ date, rank, networth, value, percent ] );
          const performance = Performance.generateProfilePerformance( profile.getHistory() );
          profile.updateData( { realtime, performance } );
          profile.save();

          profileData = profile.getData();
        }

        // --- skip profiles if their networth is less than $1B ---
        if ( networth < 1000 && networth - value < 1000 ) continue;

        // --- aggregate mover data ---
        Mover.aggregate( realtime, uri, profileData.info!.name.shortName, mover, total );

        // --- push list item ---
        items.push( listItem( { parsed, profileData, profile, flag, rankDiff, realtime } ) );

        count++; total += networth;
        woman += +( profileData.info?.gender === 'f' );
      }

      // --- create "rtb" list ---
      const list = List.get( 'rtb' ) ?? List.create( 'rtb', indexItem() );

      if ( ! list ) throw new Error( 'Failed to create or retrieve RTB list' );
      this.log( `Saving RTB list dated ${ date } (${ count } items)` );

      // --- create stats ---
      const stats = parser.stats( {
        date, count, total, woman,
        today: { value: mover.today.total.value, percent: mover.today.total.percent },
        ytd: { value: mover.ytd.total.value, percent: mover.ytd.total.percent }
      } );

      const globalStats = { ...stats, stats: {
        profiles: ProfileIndex.getInstance().size,
        days: list.getDates().length
      } };

      // --- save data ---
      list.saveSnapshot( { date, count, items, stats } );
      RTBJob.mover.saveSnapshot( mover );
      RTBJob.queue.addMany( queue );
      RTBJob.stats.setGlobalStats( globalStats );
      RTBJob.stats.updateHistory( globalStats );
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'rtb',
    desc: 'Proceed daily real-time billionaires list'
  } as const;

  // --- cron job definition ---

  public static readonly cron: TCronJob = [ {
    cronexpr: '15 0 * * *', // run at 0:15 AM on every day
  } ] as const;
}
