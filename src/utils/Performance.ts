import type { TExtrema, TReturns } from '@rtbnext/schema/src/base/assets';
import type { TProfileHistory, TProfileHistoryItem } from '@rtbnext/schema/src/model/profile';


export class Performance {
  private static readonly RETURNS = {
    week: 7, month: 30, quarter: 90, halfYear: 182, year: 365, twoYear: 730, fiveYear: 1825
  } as const;

  public static getProfileExtrema ( history: TProfileHistory ) : TExtrema {
    const map = ( [ date, rank, networth ]: TProfileHistoryItem ) => ( { date, rank, networth } );

    const [ low, high ] = history.toReversed().reduce(
      ( [ l, h ], row ) => [ ! l || row[ 2 ] < l[ 2 ] ? row : l, ! h || row[ 2 ] > h[ 2 ] ? row : h ],
      [] as [ TProfileHistoryItem?, TProfileHistoryItem? ]
    );

    return { low: low && map( low ), high: high && map( high ) };
  }

  public static generateProfileReturns ( history: TProfileHistory ) : TReturns {}

  public static generateProfilePerformance () {}
}
