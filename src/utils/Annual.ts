import type { TProfileHistory } from '@rtbnext/schema/src/model/profile';

import type { TAnnualRawData } from '@/type/annual';


export class Annual {
  private static aggregate ( history: TProfileHistory, year: number ) : TAnnualRawData {
    const rank: number[] = [], networth: number[] = [];
    let prevRank: number | undefined = undefined;
    let prevNetworth: number | undefined = undefined;
    let hadBefore = false;

    for ( let i = history.length - 1; i >= 0; i-- ) {
      const [ date, rnk, ntw ] = history[ i ];
      const y = +date.slice( 0, 4 );

      if ( y > year ) continue;

      if ( y === year - 1 ) {
        prevRank ??= rnk;
        prevNetworth ??= ntw;
      }

      if ( y < year ) hadBefore = true;
      if ( hadBefore ) break;
      if ( y !== year ) continue;

      rank.push( rnk );
      networth.push( ntw );
    }

    return { rank, networth, prevRank, prevNetworth, hadBefore };
  }
}
