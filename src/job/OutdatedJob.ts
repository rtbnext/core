import { Job } from '@/abstract/Job';
import { Parser } from '@/parser/Parser';
import type { TCommandJob, TCronJob, TOutdatedJobOptions } from '@/type/job';


export class OutdatedJob extends Job< TOutdatedJobOptions > {
  constructor ( options: TOutdatedJobOptions = {} ) { super( options, 'outdated', [ 'system' ] ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {
      //
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
