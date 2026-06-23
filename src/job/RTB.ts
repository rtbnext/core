import type { TRTBListItem } from '@rtbnext/schema/src/model/list';

import { Job } from '@/abstract/Job';
import { Fetch } from '@/core/Fetch';
import { ProfileQueue } from '@/core/Queue';
import { List } from '@/model/List';
import { Mover } from '@/model/Mover';
import { Profile } from '@/model/Profile';
import { ProfileIndex } from '@/model/ProfileIndex';
import { Stats } from '@/model/Stats';
import { PersonListParser } from '@/parser/ListParser';
import { Parser } from '@/parser/Parser';
import type { TJobClsOptions, TJobDefinition } from '@/type/job';
import type { TQueueOptions } from '@/type/queue';
import type { TPersonListEntry } from '@/type/response';
import { Performance } from '@/util/Performance';
import { ProfileManager } from '@/util/ProfileManager';


export class RTBJob extends Job {
  private static readonly fetch = Fetch.getInstance();
  private static readonly mover = Mover.getInstance();
  private static readonly queue = ProfileQueue.getInstance();
  private static readonly stats = Stats.getInstance();

  constructor ( options: TJobClsOptions ) { super( options, 'rtb' ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {
      const res = await RTBJob.fetch.list< TPersonListEntry >( 'rtb', '0' );
      if ( ! res?.success || ! res.data ) throw new Error( 'Request failed' );

      const date = Parser.date( undefined, 'ymd' )!;
      const year = Number( date.substring( 0, 4 ) );
      const ts = new Date( date ).getTime();

      if ( RTBJob.stats.getGlobalStats().date === date ) {
        this.log( 'RTB list is already up to date' );
        return;
      }

      const th = Date.now() - Job.config.queue.tsThreshold;
      const rawList = res.data.personList.personsLists;
      const entries = rawList.filter( i => i.rank && i.finalWorth ).filter( Boolean )
        .sort( ( a, b ) => a.rank! - b.rank! );

      this.log( `Processing RTB list dated ${ date } (${ entries.length } items)` );

      // --- process list data ---
      let count = 0, total = 0, woman = 0;
      const items: TRTBListItem[] = [];
      const mover = Mover.factory( date );
      const queue: TQueueOptions[] = [];

      for ( const [ i, raw ] of Object.entries( entries ) ) {
        raw.date = ts;

        // --- parse raw list data ---
        const parser = new PersonListParser( raw );
        const uri = parser.uri();
        const id = parser.id();
        const rank = parser.rank();
        const networth = parser.networth();

        if ( ! rank || ! networth ) {
          this.log( `Skipping invalid RTB entry for ${ uri }` );
          continue;
        }

        let profileData = Profile.factory( {
          uri, id,
          info: parser.info(),
          bio: parser.bio(),
          assets: parser.assets()
        } );

        // --- process profile using ProfileManager ---
        const { profile, action } = ProfileManager.process( uri, id, profileData, [], 'updateData' );

        if ( ! profile ) {
          this.log( `Failed to process profile for ${ uri }` );
          continue;
        }

        ProfileManager.updateQueue( queue, profile, action, th );
        profileData = profile.getData();

        // --- process realtime data ---
        const prev = entries[ Number( i ) - 1 ]?.uri;
        const next = entries[ Number( i ) + 1 ]?.uri;
        const realtime = parser.realtime( profileData, prev, next );
        const { value = 0, percent = 0 } = realtime?.today ?? {};

        // --- update profile data ---
        profile.addHistory( [ date, rank, networth, value, percent ] );
        const performance = Performance.generateProfilePerformance( profile.getHistory() );
        profile.updateData( { realtime, performance } );
        profile.save();

        profileData = profile.getData();
        const name = profileData.info!.name.shortName;

        // --- calc YTD rank diff ---
        const { flag, rankDiff } = Performance.getYTDRankDiff( rank, year, profileData.annual );

        // --- aggregate mover data ---
        Mover.aggregate( realtime, uri, name, mover, total );

        // --- push list item ---
        items.push( {
          uri, rank, networth, name, flag, rankDiff,
          gender: profileData.info?.gender,
          age: parser.age(),
          today: realtime?.today,
          ytd: realtime?.ytd,
          citizenship: profileData.info?.citizenship,
          industry: profileData.info?.industry!,
          source: profileData.info?.source!
        } );

        count++; total += networth;
        woman += +( profileData.info?.gender === 'f' );
      }

      // --- create "rtb" list ---
      const list = List.get( 'rtb' ) || List.create( 'rtb', {
        uri: 'rtb',
        name: 'The World’s Real-Time Billionaires',
        shortName: 'Real-Time Billionaires',
        desc: 'Today’s richest people in the world',
        text: 'todays richest people world',
        date, count,
        columns: [ 'rank', 'diff', 'profile', 'networth', 'today', 'ytd', 'age', 'citizenship', 'source' ],
        filters: [ 'gender', 'industry', 'citizenship', 'diff', 'age' ]
      } );

      if ( ! list ) throw new Error( 'Failed to create or retrieve RTB list' );
      this.log( `Saving RTB list dated ${ date } (${ count } items)` );

      // --- create stats ---
      const stats = PersonListParser.stats( {
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

  public static readonly definition: TJobDefinition = {
    id: 'rtb',
    desc: 'Proceed daily real-time billionaires list',
    options: []
  } as const;
}
