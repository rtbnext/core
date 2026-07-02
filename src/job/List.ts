import type { TBillionairesListItem, TPersonListItem } from '@rtbnext/schema/src/model/list';

import { Job } from '@/abstract/Job';
import { Fetch } from '@/core/Fetch';
import { ListQueue } from '@/core/Queue';
import { getListConfigByUri } from '@/lib/list';
import { List } from '@/model/List';
import { Profile } from '@/model/Profile';
import { Parser } from '@/parser/Parser';
import type { TCommandJob, TCronJob, TListJobOptions } from '@/type/job';
import type { TQueueOptions } from '@/type/queue';
import type { TPersonListEntry } from '@/type/response';
import { ProfileManager } from '@/util/ProfileManager';


type TListQueueItem = { uri: string, args: { year?: string, name?: string, desc?: string } };

export class ListJob extends Job< TListJobOptions > {
  private static readonly fetch = Fetch.getInstance();
  private static readonly queue = ListQueue.getInstance();

  constructor ( options: TListJobOptions = {} ) { super( options, 'list' ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {
      const method = this.options.profileUpdate ? 'updateData' : 'createOnly';
      const { uri, args } = this.options.list ? { uri: this.options.list, args: this.options }
        : ListJob.queue.next()[ 0 ] as TListQueueItem;

      // --- if no URI is provided, exit the job ---
      if ( ! uri ) return;

      // --- check if the list already exists for the specified year ---
      let list = List.get( uri );
      if ( list && args.year && ! this.options.override && list.datesInYear( args.year ).length )
        throw new Error( `List with URI ${ uri } already exists for year ${ args.year }` );

      // --- fetch raw list data from Forbes ---
      const res = await ListJob.fetch.list< TPersonListEntry >( uri, args.year ?? '0' );
      if ( ! res?.success || ! res.data ) throw new Error( 'Request failed' );

      const { parser, indexItem, listItem } = getListConfigByUri( uri );
      const th = Date.now() - Job.config.queue.tsThreshold;
      const { entries } = parser.prepareList( res );

      this.log( `Processing ${ uri } list for year ${ args.year ?? '-' } (${ entries.length } items)` );

      // --- process list data ---
      let count = 0, total = 0, woman = 0, { name, desc } = args;
      const items: ( TPersonListItem | TBillionairesListItem )[] = [];
      const queue: TQueueOptions[] = [];

      for ( const raw of Object.values( entries ) ) {
        name ??= Parser.string( raw.name );
        desc ??= Parser.string( raw.listDescription );

        const parsed = new parser( raw );
        const uri = parsed.uri();
        const id = parsed.id();

        let profileData = Profile.factory( {
          uri, id,
          info: parsed.info(),
          bio: parsed.bio()
        } );

        // --- process profile using ProfileManager ---
        const { profile, action } = ProfileManager.process( uri, id, profileData, method );

        if ( ! profile ) {
          this.log( `Failed to process profile for ${ uri }` );
          continue;
        }

        ProfileManager.updateQueue( queue, profile, action, th );
        profileData = profile.getData();

        // --- push list item ---
        items.push( listItem( { parsed, profileData } as any ) );

        count++; total += parsed.networth() ?? 0;
        woman += +( profileData.info?.gender === 'f' );
      }

      // --- create list (if not exists) ---
      const ctx = { name: name ?? '', desc: desc ?? '' };
      list ??= List.create( uri, indexItem( uri, ctx ) );
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'list',
    desc: 'Fetch and process Forbes lists',
    options: [ {
      name: '-l, --list <URI>',
      desc: 'Specify the list URI to process'
    }, {
      name: '-y, --year <YYYY>',
      desc: 'Specify the year to process the list for'
    }, {
      name: '--name <NAME>',
      desc: 'Specify a name for the list'
    }, {
      name: '--desc <DESC>',
      desc: 'Specify a description for the list'
    }, {
      name: '-o, --override',
      desc: 'If set, existing lists will be overridden with new data'
    }, {
      name: '-u, --update',
      desc: 'If set, profile data will be updated when processing lists'
    } ]
  } as const;

  // --- cron job definition ---

  public static readonly cron: TCronJob = [ {
    cronexpr: '*/15 1 * * *', // run every 15 minutes between 1:00 and 1:59 AM
  } ] as const;
}
