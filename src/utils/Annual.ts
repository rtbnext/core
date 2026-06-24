import type { TProfileHistory } from '@rtbnext/schema/src/model/profile';

import type { TAnnualRawData } from '@/type/annual';


export class Annual {
  private static aggregate ( history: TProfileHistory, year: number ) : TAnnualRawData {
    const rank: number[] = [], networth: number[] = [];
    let prevRank: number, prevNet: number, hadBefore = false;

    return { rank, networth, prevRank, prevNetworth, hadBefore };
  }
}