import { TRanking, TRankingItem } from '@rtbnext/schema/src/abstract/assets';

import { ListQueue } from '@/core/Queue';
import { ListIndex } from '@/model/ListIndex';
import { TProfileResponse } from '@/types/response';
import { TQueueOptions } from '@/types/queue';

export class Ranking {

    private static readonly index = ListIndex.getInstance();
    private static readonly queue = ListQueue.getInstance();

    public static generateProfileRanking (
        sortedLists: TProfileResponse[ 'person' ][ 'personLists' ], rankingData: TRanking[] = [],
        history: boolean = true, addQueue: boolean = true
    ) : TRanking[] {
        const lists = new Map( rankingData.map( r => [ r.list, r ] ) );
        const entries = new Map< string, TRankingItem[] >();
        const names = new Map< string, { name: string, desc?: string } >();
        const queue: TQueueOptions[] = [];
        const result: TRanking[] = [];

        if ( addQueue && queue.length ) this.queue.addMany( queue );
        return result;
    }

}
