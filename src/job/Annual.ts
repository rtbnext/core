import { Job } from '@/abstract/Job';
import { Parser } from '@/parser/Parser';
import type { TAnnualJobOptions, TJobDefinition } from '@/type/job';
import { Annual } from '@/util/Annual';


export class AnnualJob extends Job< TAnnualJobOptions > {
  constructor ( options: TAnnualJobOptions ) { super( options, 'annual' ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => Annual.generateAll( this.options.year ) );
  }

  // --- command definition ---

  public static readonly definition: TJobDefinition = {
    id: 'annual',
    desc: 'Generate annual records for profiles',
    options: [ {
      name: '-y, --year <YEAR>',
      desc: 'The year for which to generate annual records',
      parser: ( v: string ) => Parser.number( v ),
      required: true
    } ]
  } as const;
}
