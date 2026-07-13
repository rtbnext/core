import type { TBillionairesListItem, TPersonListItem } from '@rtbnext/schema/src/model/list';

import { Job } from '@/abstract/Job';
import { Fetch } from '@/core/Fetch';
import { ListQueue, ProfileQueue } from '@/core/Queue';
import type { IList } from '@/interface/list';
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
  private static readonly profileQueue = ProfileQueue.getInstance();
  private static readonly queue = ListQueue.getInstance();

  constructor ( options: TListJobOptions = {} ) { super( options, 'list', [ 'profile', 'list' ] ) }

  // --- job runner ---

  private hasSnapshot ( list: IList, year?: string | number ) : boolean {
    return !! ( list && year && ! this.options.override && list.datesInYear( year ).length );
  }

  public async proceedList ( { uri: listUri, args }: TListQueueItem ) : Promise< boolean > {
    const method = this.options.profileUpdate ? 'updateData' : 'createOnly';

    // --- get list instance (if exists) ---
    let list = List.get( listUri );

    // --- check if the list already exists for the specified year ---
    if ( list && this.hasSnapshot( list, args.year ) ) {
      this.log( `List with URI ${ listUri } already exists for year ${ args.year }`, { uri: listUri, year: args.year }, 'warn' );
      return false;
    }

    // --- fetch raw list data from Forbes ---
    const res = await ListJob.fetch.list< TPersonListEntry >( listUri, args.year ?? '0' );
    if ( ! res?.success || ! res.data ) throw new Error( 'Request failed' );

    const { parser, indexItem, listItem } = getListConfigByUri( listUri );
    const th = Date.now() - Job.config.queue.tsThreshold;
    const { entries } = parser.prepareList( res );

    // --- determine list date ---
    const d = new Date( entries[ 0 ].date ?? entries[ 0 ].timestamp );
    if ( Number.isNaN( d.getTime() ) ) throw new Error( `Failed to determine date for ${ listUri } list` );
    if ( args.year && d.getFullYear() !== +args.year )
      throw new Error( `List year ${ args.year } does not match data year ${ d.getFullYear() }` );

    this.log( `Processing ${ listUri } list for year ${ args.year ?? '-' } (${ entries.length } items)` );

    // --- process list data ---
    let count = 0, total = 0, woman = 0, { name, desc } = args;
    const date = Parser.date( d, 'ymd' )!;
    const items: ( TPersonListItem | TBillionairesListItem )[] = [];
    const queue: TQueueOptions[] = [];

    for ( const raw of Object.values( entries ) ) {
      name ??= Parser.string( raw.name );
      desc ??= Parser.string( raw.listDescription );

      const parsed = new parser( raw ), uri = parsed.uri(), id = parsed.id();
      let profileData = Profile.factory( { uri, id, info: parsed.info(), bio: parsed.bio() } );

      // --- process profile using ProfileManager ---
      const { profile, action } = ProfileManager.process( uri, id, profileData, method ) || {};

      if ( ! profile || ! action ) this.log( `Failed to process profile for ${ uri }`, undefined, 'warn' );
      else {
        ProfileManager.updateQueue( queue, profile, action, th );
        profileData = profile.getData();
      }

      // --- push list item ---
      items.push( listItem( { parsed, profileData, profile } as any ) );

      count++; total += parsed.networth() ?? 0;
      woman += +( profileData.info?.gender === 'f' );
    }

    // --- create list (if not exists) ---
    if ( ! name || ! desc ) throw new Error( `Failed to determine name or description for ${ listUri } list` );
    list ??= List.create( listUri, indexItem( listUri, { name, desc } ) ) || undefined;

    if ( ! list ) throw new Error( `Failed to create or retrieve ${ listUri } list` );
    this.log( `Saving ${ listUri } list for year ${ args.year ?? '-' } (${ count } items)` );

    // --- create stats ---
    const stats = parser.stats( { date, count, total, woman } );

    // --- save data ---
    list.saveSnapshot( { date, count, items, stats }, this.options.override );
    ListJob.profileQueue.addMany( queue );

    return true;
  }

  public async run () : Promise< void > {
    await this.protect( async () => {
      if ( this.options.list ) return await this.proceedList( { uri: this.options.list, args: this.options } );

      // --- if no uri is specified, run the queue ---
      let attempts = 100;

      while ( attempts-- > 0 ) {
        const item = ListJob.queue.next()[ 0 ] as TListQueueItem;

        // --- if there is no queue item, exit the job ---
        if ( ! item?.uri ) return;

        // --- run the queue item
        if ( await this.proceedList( item ) ) return;
      }
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
    cronexpr: '*/10 1 * * *', // run every 10 minutes between 1:00 and 1:59 AM
  } ] as const;
}
