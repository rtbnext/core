import type { TRTBListItem } from '@rtbnext/schema/src/model/list';

import { Job } from '@/abstract/Job';
import { Fetch } from '@/core/Fetch';
import { ProfileQueue } from '@/core/Queue';
import { Mover } from '@/model/Mover';
import { Profile } from '@/model/Profile';
import { Stats } from '@/model/Stats';
import { PersonListParser } from '@/parser/ListParser';
import { Parser } from '@/parser/Parser';
import type { TJobClsOptions, TJobDefinition } from '@/type/job';
import type { TQueueOptions } from '@/type/queue';
import type { TPersonListEntry } from '@/type/response';
import { ProfileManager } from '@/util/ProfileManager';


export class RTBJob extends Job {
  private static readonly fetch = Fetch.getInstance();
  private static readonly queue = ProfileQueue.getInstance();
  private static readonly stats = Stats.getInstance();

  constructor ( options: TJobClsOptions ) { super( options, 'rtb' ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {
      const res = await RTBJob.fetch.list< TPersonListEntry >( 'rtb', '0' );
      if ( ! res?.success || ! res.data ) throw new Error( 'Request failed' );

      const rawList = res.data.personList.personsLists;
      const date = Parser.date( rawList[ 0 ].timestamp, 'ymd' )!;
      const ts = new Date( date ).getTime();

      if ( RTBJob.stats.getGlobalStats().date === date ) {
        this.log( 'RTB list is already up to date' );
        return;
      }

      const th = Date.now() - Job.config.queue.tsThreshold;
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
      }
    } );
  }

  // --- command definition ---

  public static readonly definition: TJobDefinition = {
    id: 'rtb',
    desc: 'Proceed daily real-time billionaires list',
    options: []
  } as const;
}
