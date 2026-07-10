import { Job } from '@/abstract/Job';
import { ListQueue, ProfileQueue } from '@/core/Queue';
import { Parser } from '@/parser/Parser';
import type { TCommandJob, TQueueJobOptions } from '@/type/job';
import type { TQueueType } from '@/type/queue';


export class QueueJob extends Job< TQueueJobOptions > {
  private static readonly queues = {
    list: ListQueue.getInstance(),
    profile: ProfileQueue.getInstance()
  } as const;

  constructor ( options: TQueueJobOptions ) { super( options, 'queue', [ 'profiles', 'lists' ] ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {
      const { type, clear, add, remove, prio, args } = this.options;

      const queue = QueueJob.queues[ type ];
      if ( ! queue ) throw new Error( `Unknown queue type: ${ type }` );

      if ( clear ) queue.clear();
      if ( add?.length ) queue.addMany( add.map( uriLike => ( { uriLike, prio, args } ) ) );
      if ( remove?.length ) queue.remove( ...remove );
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'queue',
    desc: 'Managing list and profile queues',
    options: [ {
      name: '-t, --type <TYPE>',
      desc: 'Which queue to use (available: list, profile)',
      parser: ( v: string ) : TQueueType => v.toLowerCase() as TQueueType,
      required: true
    }, {
      name: '--add <URIs>',
      desc: 'Add items to the queue (comma-separated)',
      parser: ( v: string ) => Parser.list( v, 'string', ',' )
    }, {
      name: '--remove <URIs>',
      desc: 'Remove items from the queue (comma-separated)',
      parser: ( v: string ) => Parser.list( v, 'string', ',' )
    }, {
      name: '--prio <NUMBER>',
      desc: 'Set priority of added items (higher number = higher priority)',
      parser: ( v: string ) => Parser.strict( v, 'number' )
    }, {
      name: '--args <JSON>',
      desc: 'Additional queue item arguments as JSON string',
      parser: ( v: string ) => Parser.strict( v, 'json' )
    }, {
      name: '-c, --clear',
      desc: 'Clear the queue before adding new items'
    } ]
  } as const;
}
