import type { TProfileData } from '@rtbnext/schema/src/model/profile';

import { Stats } from '@/model/Stats';


export class DropOff {
  private static readonly stats = Stats.getInstance();

  public static check ( data: Partial< TProfileData > ) : boolean {
    const today = DropOff.stats.getGlobalStats()?.date;
    const { realtime } = data;

    return ( ! realtime || realtime.date !== today || ! realtime.rank || ! realtime.networth || (
      realtime.networth < 1000 && realtime.networth - ( realtime.today?.value ?? 0 ) < 1000
    ) );
  }

  public static update ( data: Partial< TProfileData > ) : Partial< TProfileData > {
    if ( ! data.info ) return data;

    data.info.flags.dropOff = DropOff.check( data );
    return data;
  }
}
