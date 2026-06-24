import type { TAnnualRecord } from '@rtbnext/schema/src/base/assets';
import type { TProfileHistory } from '@rtbnext/schema/src/model/profile';

import type { TAnnualRawData } from '@/type/annual';


export class Annual {
  private static readonly handler = {
    rank: {
      sort: ( a: number, b: number ) => a - b,
    },
    networth: {
      sort: ( a: number, b: number ) => b - a
    }
  } as const;

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

  private static record ( raw: TAnnualRawData, type: keyof typeof Annual.handler ) : TAnnualRecord | undefined {
    const data = raw[ type ], len = data?.length ?? 0;
    if ( len === 0 ) return;

    const { sort } = Annual.handler[ type ];
    const first = data[ len - 1 ], last = data[ 0 ], diff = sort( first, last );
    const sorted = data.sort( sort );
    const max = sorted[ 0 ], min = sorted[ len - 1 ];
    const mean = sorted.reduce( ( sum, v ) => sum + v, 0 ) / len;
    const median = sorted[ Math.floor( len / 2 ) ];
    const range = Math.abs( max - min );
    const stdDev = Math.sqrt( sorted.reduce( ( sum, v ) => sum + ( v - mean ) ** 2, 0 ) / len );

    return { first, last, max, min, diff, flag: 'unknown', mean, median, range, stdDev };
  }
}
