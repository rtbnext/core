import { Job } from '@/abstract/Job';
import { Parser } from '@/parser/Parser';
import type { TCommandJob, TIndexJobOptions } from '@/type/job';


export class IndexJob extends Job< TIndexJobOptions > {
  constructor ( options: TIndexJobOptions ) { super( options, 'index' ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {} );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'index',
    desc: 'Rebuild index files',
    options: [ {
      name: '-t, --target <TARGETs>',
      desc: 'Targets to rebuild, default to "all" (available: filter, mover, list, profile; comma-separated)',
      parser: ( v: string ) => Parser.list( v, 'string', ',' )
    } ]
  } as const;
}
