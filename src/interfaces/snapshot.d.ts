import type { TSnapshot } from '@rtbnext/schema/src/base/generic';


export interface ISnapshot< T extends TSnapshot > {
  getDates () : string[];
  hasDate ( dateLike: string ) : boolean;
  firstDate () : string | undefined;
  latestDate () : string | undefined;
  nearestDate ( dateLike: string ) : string | undefined;
  datesInRange ( from: string, to: string ) : string[];
  datesInYear ( year: string | number ) : string[];
  firstInYear ( year: string | number ) : string | undefined;
  latestInYear ( year: string | number ) : string | undefined;
  getSnapshot ( dateLike: string, exactMatch?: boolean ) : T | undefined;
  getLatest () : T | undefined;
  saveSnapshot ( snapshot: T, force?: boolean ) : boolean;
}
