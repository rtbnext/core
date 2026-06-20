import type { TRanking } from '@rtbnext/schema/src/base/assets';

import { ListQueue } from '@/core/Queue';
import { ListIndex } from '@/model/ListIndex';
import type { TProfileResponse } from '@/type/response';


export class Ranking {
  private static readonly index = ListIndex.getInstance();
  private static readonly queue = ListQueue.getInstance();

  public static generateProfileRanking (
    sortedLists: TProfileResponse[ 'person' ][ 'personLists' ], rankingData: TRanking[] = [],
    history: boolean = true, addQueue: boolean = true
  ) : TRanking[] {
    const result: TRanking[] = [];

    return result;
  }
}
