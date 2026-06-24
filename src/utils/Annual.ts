import type { TAnnualRecord } from '@rtbnext/schema/src/base/assets';
import type { TChangeFlag } from '@rtbnext/schema/src/base/const';
import type { TProfileHistory } from '@rtbnext/schema/src/model/profile';

import { Parser } from '@/parser/Parser';
import type { TAnnualRawData } from '@/type/annual';


export class Annual {
  private static readonly handler = {
    rank: {
      sort: ( a: number, b: number ) => a - b,
      parse: ( v: number ) => Parser.number( v, 0 ),
      flag: ( raw: TAnnualRawData ) : TChangeFlag => {
        if ( raw.prevRank !== undefined ) {
          if ( raw.networth[ 0 ] < 1000 ) return 'dropoff';

          const diff = raw.prevRank - raw.rank[ 0 ];
          return diff > 0 ? 'up' : diff < 0 ? 'down' : 'unchanged';
        } else {
          return raw.hadBefore ? 'returned' : 'new';
        }
      }
    },
    networth: {
      sort: ( a: number, b: number ) => b - a,
      parse: Parser.money,
      flag: ( raw: TAnnualRawData ) : TChangeFlag => {
        if ( raw.prevNetworth === undefined ) return 'unknown';

        const diff = raw.networth[ 0 ] - raw.prevNetworth;
        return diff > 0 ? 'up' : diff < 0 ? 'down' : 'unchanged';
      }
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

    const { sort, parse, flag } = Annual.handler[ type ];
    const first = data[ len - 1 ], last = data[ 0 ];
    const sorted = data.sort( sort );
    const max = sorted[ 0 ], min = sorted[ len - 1 ];
    const mean = sorted.reduce( ( sum, v ) => sum + v, 0 ) / len;

    return {
      first: parse( first ), last: parse( last ), max: parse( max ), min: parse( min ),
      diff: parse( sort( first, last ) ), flag: flag( raw ), mean: parse( mean ),
      median: parse( sorted[ Math.floor( len / 2 ) ] ), range: parse( Math.abs( max - min ) ),
      stdDev: parse( Math.sqrt( sorted.reduce( ( sum, v ) => sum + ( v - mean ) ** 2, 0 ) / len ) )
    };
  }
}
