import { Job } from '@/abstract/Job';
import { Fetch } from '@/core/Fetch';
import { ListQueue } from '@/core/Queue';
import type { TCommandJob, TCronJob, TListJobOptions } from '@/type/job';
import type { TPersonListEntry } from '@/type/response';


export class ListJob extends Job< TListJobOptions > {
  private static readonly fetch = Fetch.getInstance();
  private static readonly queue = ListQueue.getInstance();

  constructor ( options: TListJobOptions = {} ) { super( options, 'list' ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {
      const { uri, args } = this.options.list ? { uri: this.options.list, args: this.options }
        : ListJob.queue.next()[ 0 ] as { uri: string, args: any };

      // --- if no URI is provided, exit the job ---
      if ( ! uri ) return;

      // --- fetch raw list data from Forbes ---
      const raw = await ListJob.fetch.list< TPersonListEntry >( uri, args.year ?? '0' );
      if ( ! raw?.success || ! raw.data ) throw new Error( 'Request failed' );
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'list',
    desc: 'Fetch and process Forbes lists',
    options: [ {
      name: '-o, --override',
      desc: 'If set, existing lists will be overridden with new data'
    }, {
      name: '-u, --update',
      desc: 'If set, profile data will be updated when processing lists'
    }, {
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
    } ]
  } as const;

  // --- cron job definition ---

  public static readonly cron: TCronJob = [ {
    cronexpr: '*/15 1 * * *', // run every 15 minutes between 1:00 and 1:59 AM
  } ] as const;
}
