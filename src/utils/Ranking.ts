import { ListIndex } from '@/collection/ListIndex';
import { Queue } from '@/core/Queue';
import { TRanking } from '@/types/generic';
import { TProfileResponse } from '@/types/response';
import { Parser } from '@/utils/Parser';

export class Ranking {

    private static readonly index = ListIndex.getInstance();
    private static readonly queue = Queue.getInstance();

    public static generateProfileRanking (
        listData: TProfileResponse[ 'person' ][ 'personLists' ], rankingData: TRanking[] = [],
        history: boolean = true, queue: boolean = true
    ) : TRanking[] {
        for ( const { listUri, date: listDate, timestamp, rank, finalWorth } of listData ) {
            if ( [ 'rtb', 'rtrl' ].includes( listUri ) ) continue;

            const date = Parser.date( listDate ?? timestamp, 'ymd' )!;
            const list = rankingData.filter( l => l.list === listUri )[ 0 ] ?? { list: listUri, date };
            if ( list.date === date ) continue;

            if ( history && list.date ) {
                list.history ??= [];
                list.history.unshift( {
                    date: list.date, rank: list.rank, networth: list.networth,
                    prev: list.prev, next: list.next
                } );
            }

            list.date = date;
            list.rank = Parser.strict( rank, 'number' );
            list.networth = Parser.strict( finalWorth, 'money' );

            if ( queue ) {
                const item = Ranking.index.get( listUri );
                if ( ! item || item.date !== listDate ) Ranking.queue.add( 'list', listUri );
            }
        }

        return rankingData;
    }

}
