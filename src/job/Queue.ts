import { Job } from '@/abstract/Job';
import type { TJobDefinition, TQueueJobOptions } from '@/type/job';


export class QueueJob extends Job< TQueueJobOptions > {
  constructor ( options: TQueueJobOptions ) { super( options, 'Queue' ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {} );
  }

  // --- command definition ---

  public static readonly definition: TJobDefinition = {
    id: 'queue',
    desc: 'Managing list and profile queues',
    options: []
  } as const;
}
