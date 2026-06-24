import { Job } from '@/abstract/Job';
import { Parser } from '@/parser/Parser';
import type { TAnnualJobOptions, TJobCommand } from '@/type/job';
import { Annual } from '@/util/Annual';


export class AnnualJob extends Job< TAnnualJobOptions > {
  constructor ( options: TAnnualJobOptions ) { super( options, 'annual' ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {
      if ( this.options.profiles?.length )
        for ( const uri of this.options.profiles )
          Annual.generate( uri, this.options.year );

      else Annual.generateAll( this.options.year );
    } );
  }

  // --- command definition ---

  public static readonly command: TJobCommand = {
    id: 'annual',
    desc: 'Generate annual records for profiles',
    options: [ {
      name: '-y, --year <YEAR>',
      desc: 'The year for which to generate annual records',
      parser: ( v: string ) => Parser.number( v ),
      required: true
    }, {
      name: '-p, --profiles <URIs>',
      desc: 'Process specific profiles by URI (comma-separated)',
      parser: ( v: string ) => Parser.list( v, 'string', ',' )
    } ]
  } as const;
}
