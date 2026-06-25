import { Job } from '@/abstract/Job';
import { Utils } from '@/core/Utils';
import { List } from '@/model/List';
import { Stats } from '@/model/Stats';
import { Parser } from '@/parser/Parser';
import type { TCommandJob, TTop10JobOptions } from '@/type/job';


export class Top10Job extends Job< TTop10JobOptions > {
  private static readonly stats = Stats.getInstance();
  constructor ( options: TTop10JobOptions ) { super( options, 'top10' ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {
      const list = List.get( 'rtb' );
      if ( ! list ) throw new Error( 'Real-time billionaires list not found' );

      const [ year, month ] = this.options.date ?? Utils.date( 'ym' ).split( '-', 2 );
      const date = Parser.date( Utils.lastMonthDay( month, year ), 'ymd' )!;

      const snapshot = list.getSnapshot( date, false );
      if ( ! snapshot ) throw new Error( `No snapshot found for ${ month }/${ year }` );

      Top10Job.stats.generateTop10Entry( snapshot );
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'top10',
    desc: 'Generate monthly top 10 ranking',
    options: [ {
      name: '-d, --date <YYYY-MM>',
      desc: 'Specify the date for the top 10 ranking',
      parser: ( v: string ) => {
        if ( ! /^\d{4}-\d{2}$/.test( v ) ) throw new Error( `Invalid date format "${ v }"; use YYYY-MM.` );
        return v.split( '-', 2 ).map( v => Number( v ) );
      }
    } ]
  } as const;
}
