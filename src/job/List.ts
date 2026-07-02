import { Job } from '@/abstract/Job';
import { Parser } from '@/parser/Parser';
import type { TCommandJob, TCronJob, TListJobOptions } from '@/type/job';


export class ListJob extends Job< TListJobOptions > {
  constructor ( options: TListJobOptions = {} ) { super( options, 'list' ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {} );
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
      desc: 'Specify a list URI to process (e.g. "billionaires")'
    }, {
      name: '-y, --year <YYYY>',
      desc: 'Specify a year to process (e.g. "2023")',
      parser: ( v: string ) => Parser.number( v )
    }, {
      name: '-n, --name <NAME>',
      desc: 'Specify a name for the list'
    }, {
      name: '-d, --desc <DESC>',
      desc: 'Specify a description for the list'
    } ]
  } as const;

  // --- cron job definition ---

  public static readonly cron: TCronJob = [ {
    cronexpr: '*/15 1 * * *', // run every 15 minutes between 1:00 and 1:59 AM
  } ] as const;
}
