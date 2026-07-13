import type { TBillionairesListItem, TPersonListItem } from '@rtbnext/schema/src/model/list';

import { Job } from '@/abstract/Job';
import { Fetch } from '@/core/Fetch';
import { ListQueue, ProfileQueue } from '@/core/Queue';
import { getListConfigByUri } from '@/lib/list';
import { List } from '@/model/List';
import { Profile } from '@/model/Profile';
import { Parser } from '@/parser/Parser';
import type { TCommandJob, TCronJob, TListJobOptions } from '@/type/job';
import type { TQueueOptions } from '@/type/queue';
import type { TPersonListEntry } from '@/type/response';
import { ProfileManager } from '@/util/ProfileManager';
import type { IList } from '@/interface/list';


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
