import type { TExtrema, TPerformance, TReturns } from '@rtbnext/schema/src/base/assets';
import type { TProfileHistory, TProfileHistoryItem } from '@rtbnext/schema/src/model/profile';

import { Parser } from '@/parser/Parser';


export class Performance {
  private static readonly RETURNS = {
    week: 7, month: 30, quarter: 90, halfYear: 182, year: 365, twoYear: 730, fiveYear: 1825
  } as const;

  public static getProfileExtrema ( history: TProfileHistory ) : TExtrema {
    const map = ( [ date, rank, networth ]: TProfileHistoryItem ) => ( {
      date, rank: Parser.number( rank ), networth: Parser.money( networth )
    } );

    const [ low, high ] = history.reduce(
      ( [ l, h ], row ) => [ ! l || row[ 2 ] < l[ 2 ] ? row : l, ! h || row[ 2 ] > h[ 2 ] ? row : h ],
      [] as [ TProfileHistoryItem?, TProfileHistoryItem? ]
    );

    return { low: low && map( low ), high: high && map( high ) };
  }

  public static generateProfileReturns ( history: TProfileHistory ) : TReturns {
    const latest = history.at( -1 );
    if ( ! latest ) return {};

    const result: TReturns = {};
    const now = Date.parse( latest[ 0 ] );
    const networth = latest[ 2 ];

    const returns = Object.entries( Performance.RETURNS );
    let remaining = Object.keys( returns ).length;

    for ( const item of history.toReversed() ) {
      const days = ( now - Date.parse( item[ 0 ] ) ) / 86400000;

      for ( const [ key, target ] of returns ) {
        if ( result[ key as keyof TReturns ] || days < target ) continue;

        result[ key as keyof TReturns ] = {
          value: Parser.money( networth - item[ 2 ] ),
          percent: Parser.pct( ( networth / ( item[ 2 ] ?? 1 ) ) * 100 )
        };

        if ( --remaining === 0 ) return result;
      }
    }

    return result;
  }

  public static generateProfilePerformance ( history: TProfileHistory ) : TPerformance {
    return {
      extrema: Performance.getProfileExtrema( history ),
      returns: Performance.generateProfileReturns( history )
    };
  }
}
