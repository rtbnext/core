import { Job } from '@/abstract/Job';
import { Filter } from '@/model/Filter';
import { List } from '@/model/List';
import { ListIndex } from '@/model/ListIndex';
import { Mover } from '@/model/Mover';
import { Parser } from '@/parser/Parser';
import type { TCommandJob, TIndexJobOptions } from '@/type/job';


export class IndexJob extends Job< TIndexJobOptions > {
  private static readonly TARGETS = [ 'filter', 'mover', 'list' ] as const;
  constructor ( options: TIndexJobOptions ) { super( options, 'index', [ 'list', 'mover', 'filter' ] ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {
      const targets = this.options.targets?.includes( 'all' ) ? IndexJob.TARGETS
        : ( this.options.targets ?? IndexJob.TARGETS );

      if ( targets.includes( 'filter' ) ) Filter.getInstance().generateIndex();
      if ( targets.includes( 'mover' ) ) Mover.getInstance().generateIndex();

      if ( targets.includes( 'list' ) )
        for ( const uri of ListIndex.getInstance().getIndex().keys() )
          List.get( uri )?.generateIndex();
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'index',
    desc: 'Rebuild index files',
    options: [ {
      name: '-t, --targets <TARGETs>',
      desc: 'Targets to rebuild, default to "all" (available: filter, mover, list; comma-separated)',
      parser: ( v: string ) => Parser.list( v, 'string', ',' )
    } ]
  } as const;
}
