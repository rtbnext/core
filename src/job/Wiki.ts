import { Job } from '@/abstract/Job';
import type { TJobDefinition, TWikiJobOptions } from '@/type/job';


export class WikiJob extends Job< TWikiJobOptions > {
  constructor ( options: TWikiJobOptions ) { super( options, 'Wiki' ) }

  // --- job runner ---

  public async run () : Promise< void > {}

  // --- command definition ---

  public static readonly definition: TJobDefinition = {
    id: 'wiki',
    desc: 'Update and assign wiki data to profiles',
    options: [ {
      name: '--profile <URI>',
      desc: 'The profile URI to process',
      required: true
    }, {
      name: '--assign <TITLE>',
      desc: 'Assign wiki data from the specified wiki title to the profile'
    } ]
  } as const;
}
