import { Job } from '@/abstract/Job';
import type { TJobDefinition, TTop10JobOptions } from '@/type/job';


export class Top10Job extends Job {
  constructor ( options: TTop10JobOptions ) { super( options, 'top10' ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {} );
  }

  // --- command definition ---

  public static readonly definition: TJobDefinition = {
    id: 'top10',
    desc: 'Generate monthly top 10 ranking',
    options: [ {
      name: '-d, --date',
      desc: 'Specify the date for the top 10 ranking (format: YYYY-MM)',
      parser: ( value: string ) => {
        if ( ! /^\d{4}-\d{2}$/.test( value ) ) throw new Error( 'Invalid date format. Use YYYY-MM.' );
        return value.split( '-', 2 ).map( ( v ) => Number( v ) );
      }
    } ]
  } as const;
}
