import type { TRanking, TRankingItem } from '@rtbnext/schema/src/base/assets';

import { ListQueue } from '@/core/Queue';
import { ListIndex } from '@/model/ListIndex';
import { Parser } from '@/parser/Parser';
import type { TQueueOptions } from '@/type/queue';
import type { TProfileResponse } from '@/type/response';


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

    // --- prep new entries from sorted lists ---

    for ( const { listUri, name, listDescription, date, timestamp, rank, finalWorth } of sortedLists ) {
      if ( [ 'rtb', 'rtrl' ].includes( listUri ) ) continue;

      const item = Parser.container< TRankingItem >( {
        date: { value: date ?? timestamp, type: 'date', args: [ 'ymd' ], strict: false },
        rank: { value: rank, type: 'number' },
        networth: { value: finalWorth, type: 'money' }
      } );

      if ( ! entries.has( listUri ) ) entries.set( listUri, [] );
      entries.get( listUri )!.push( item );
      names.set( listUri, { name, desc: listDescription } );
    }

    const result: TRanking[] = [];

    return result;
  }
}
