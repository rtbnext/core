import { Job } from '@/abstract/Job';
import { ProfileQueue } from '@/core/Queue';
import { Profile } from '@/model/Profile';
import { ProfileIndex } from '@/model/ProfileIndex';
import { Parser } from '@/parser/Parser';
import type { TCommandJob, TCronJob, TOutdatedJobOptions } from '@/type/job';
import type { TQueueOptions } from '@/type/queue';


export class OutdatedJob extends Job< TOutdatedJobOptions > {
  private static readonly index = ProfileIndex.getInstance();
  private static readonly queue = ProfileQueue.getInstance();

  constructor ( options: TOutdatedJobOptions = {} ) { super( options, 'outdated', [ 'system' ] ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {
      const prio = this.options.prio ?? 0;
      const th = this.options.date ? Date.parse( this.options.date ) : Date.now() - 7.776e9;
      const queue: TQueueOptions[] = [];

      for ( const item of OutdatedJob.index.values ) {
        const profile = Profile.getByItem( item );
        if ( profile && ( profile.lastLookup() ?? 0 ) < th ) queue.push( { uriLike: profile.getUri(), prio } );
      }

      this.log( `Found ${ queue.length } outdated profiles (older than ${ Parser.date( new Date( th ), 'ymd' ) })` );
      OutdatedJob.queue.addMany( queue );
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'outdated',
    desc: 'Find outdated profiles and add them to the queue',
    options: [ {
      name: '-d, --date <DATE>',
      desc: 'Date to check for outdated profiles (YYYY-MM-DD)',
      parser: ( v: string ) => Parser.date( v, 'ymd' )
    }, {
      name: '--prio <NUMBER>',
      desc: 'Set priority of added items (higher number = higher priority)',
      parser: ( v: string ) => Parser.strict( v, 'number' )
    } ]
  } as const;

  // --- cron job definition ---

  public static readonly cron: TCronJob< TOutdatedJobOptions > = [ {
    cronexpr: '10 0 1 * *', // run at 0:10 on the first day of every month
  } ] as const;
}
