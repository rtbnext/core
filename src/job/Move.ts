import { Job } from '@/abstract/Job';
import type { TJobDefinition, TMoveJobOptions } from '@/type/job';


export class MoveJob extends Job< TMoveJobOptions > {
  constructor ( options: TMoveJobOptions ) { super( options, 'Move' ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {
      //
    } );
  }

  // --- command definition ---

  public static readonly definition: TJobDefinition = {
    id: 'move',
    desc: 'Move a profile from one URI to another',
    options: [ {
      name: '--from <URI>',
      desc: 'The profile URI to move from',
      required: true
    }, {
      name: '--to <URI>',
      desc: 'The profile URI to move to',
      required: true
    } ]
  } as const;
}
