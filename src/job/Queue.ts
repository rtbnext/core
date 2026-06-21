import { Job } from '@/abstract/Job';
import { ListQueue, ProfileQueue } from '@/core/Queue';
import { Parser } from '@/parser/Parser';
import type { TJobDefinition, TQueueJobOptions } from '@/type/job';
import type { TQueueType } from '@/type/queue';


export class QueueJob extends Job< TQueueJobOptions > {
  private static readonly queues = {
    list: ListQueue.getInstance,
    profile: ProfileQueue.getInstance
  } as const;

  constructor ( options: TQueueJobOptions ) { super( options, 'Queue' ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {
      //
    } );
  }

  // --- command definition ---

  public static readonly definition: TJobDefinition = {
    id: 'queue',
    desc: 'Managing list and profile queues',
    options: [ {
      name: '--type <TYPE>',
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
      parser: ( v: string ) => Parser.number( v )
    }, {
      name: '--args <JSON>',
      desc: 'Additional queue item arguments as JSON string',
      parser: ( v: string ) => JSON.parse( v )
    }, {
      name: '--clear',
      desc: 'Clear the queue before adding new items'
    } ]
  } as const;
}
