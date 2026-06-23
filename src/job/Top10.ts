import type { TTop10List } from '@rtbnext/schema/src/model/stats';

import { Job } from '@/abstract/Job';
import { Utils } from '@/core/Utils';
import { List } from '@/model/List';
import { Parser } from '@/parser/Parser';
import type { TJobDefinition, TTop10JobOptions } from '@/type/job';


export class Top10Job extends Job< TTop10JobOptions > {
  constructor ( options: TTop10JobOptions ) { super( options, 'top10' ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {
      const list = List.get( 'rtb' );
      if ( ! list ) throw new Error( 'Real-time billionaires list not found' );

      const [ year, month ] = this.options.date ?? Utils.date( 'ym' ).split( '-', 2 );
      const date = Parser.date( Utils.lastMonthDay( month, year ), 'ymd' )!;

      this.log( `Searching for real-time billionaires list snapshot for ${ date }` );
      const snapshot = list.getSnapshot( date, false );
      if ( ! snapshot ) throw new Error( `No snapshot found for ${ date }` );

      const top10: TTop10List = [];
      for ( const { uri, rank, networth } of snapshot.items.slice( 0, 10 ) ) {
        top10.push( { uri, rank, networth, flag: 'unknown' } );
      }
    } );
  }

  // --- command definition ---

  public static readonly definition: TJobDefinition = {
    id: 'top10',
    desc: 'Generate monthly top 10 ranking',
    options: [ {
      name: '-d, --date <YYYY-MM>',
      desc: 'Specify the date for the top 10 ranking',
      parser: ( v: string ) => {
        if ( ! /^\d{4}-\d{2}$/.test( v ) ) throw new Error( `Invalid date format: ${ v }. Use YYYY-MM.` );
        return v.split( '-', 2 ).map( ( v ) => Number( v ) );
      }
    } ]
  } as const;
}
