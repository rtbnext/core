import type { TMover, TMoverData, TMoverEntry } from '@rtbnext/schema/src/model/mover';

import { Snapshot } from '@/abstract/Snapshot';
import type { IMover } from '@/interface/mover';


export class Mover extends Snapshot< TMover > implements IMover {
  private static instance: Mover;
  private constructor () { super( 'mover', 'json' ) }

  // --- prepare mover entries ---

  private prep ( arr: TMoverEntry[], dir: 'asc' | 'desc' = 'asc' ) : TMoverEntry[] {
    return arr.sort( ( a, b ) => dir === 'asc' ? a.value - b.value : b.value - a.value ).slice( 0, 10 );
  }

  private prepWinner ( snapshot: TMoverData ) : TMoverEntry[][] {
    return [
      snapshot.today.networth.winner, snapshot.today.percent.winner,
      snapshot.ytd.networth.winner, snapshot.ytd.percent.winner
    ].map( a => this.prep( a, 'desc' ) );
  }

  private prepLoser ( snapshot: TMoverData ) : TMoverEntry[][] {
    return [
      snapshot.today.networth.loser, snapshot.today.percent.loser,
      snapshot.ytd.networth.loser, snapshot.ytd.percent.loser
    ].map( a => this.prep( a, 'asc' ) );
  }
}
