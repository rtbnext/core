import type { TExtrema } from '@rtbnext/schema/src/base/assets';
import type { TProfileHistory, TProfileHistoryItem } from '@rtbnext/schema/src/model/profile';


export class Performance {
  public static getProfileExtrema ( history: TProfileHistory ) : TExtrema {
    const map = ( [ date, rank, networth ]: TProfileHistoryItem ) => ( { date, rank, networth } );

    const [ low, high ] = history.reverse().reduce(
      ( [ l, h ], row ) => [ ! l || row[ 2 ] < l[ 2 ] ? row : l, ! h || row[ 2 ] > h[ 2 ] ? row : h ],
      [] as [ TProfileHistoryItem?, TProfileHistoryItem? ]
    );

    return { low: low && map( low ), high: high && map( high ) };
  }

  public static generateProfileReturns () {}

  public static generateProfilePerformance () {}
}
