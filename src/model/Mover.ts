import type { TChangeItem, TRealtime } from '@rtbnext/schema/src/base/assets';
import type { TMover, TMoverData, TMoverEntry, TMoverItem, TMoverSubject } from '@rtbnext/schema/src/model/mover';

import { Snapshot } from '@/abstract/Snapshot';
import { Utils } from '@/core/Utils';
import type { IMover } from '@/interface/mover';
import { Parser } from '@/parser/Parser';


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

  // --- (override) save mover snapshot ---

  public override saveSnapshot ( snapshot: TMoverData, force?: boolean ) : boolean {
    const winner = this.prepWinner( snapshot );
    const loser = this.prepLoser( snapshot );

    return super.saveSnapshot( {
      ...Utils.metaData(),
      ...Parser.container< TMoverData >( {
        date: { value: snapshot.date, type: 'date' },
        today: { value: Parser.container< TMoverItem >( {
          total: { value: Parser.container< TChangeItem >( {
            value: { value: snapshot.today.total.value, type: 'money' },
            percent: { value: snapshot.today.total.percent, type: 'pct' }
          } ), type: 'container' },
          networth: { value: Parser.container< TMoverSubject >( {
            winner: { value: winner[ 0 ], type: 'money' },
            loser: { value: loser[ 0 ], type: 'money' }
          } ), type: 'container' },
          percent: { value: Parser.container< TMoverSubject >( {
            winner: { value: winner[ 1 ], type: 'pct' },
            loser: { value: loser[ 1 ], type: 'pct' }
          } ), type: 'container' }
        } ), type: 'container' },
        ytd: { value: Parser.container< TMoverItem >( {
          total: { value: Parser.container< TChangeItem >( {
            value: { value: snapshot.ytd.total.value, type: 'money' },
            percent: { value: snapshot.ytd.total.percent, type: 'pct' }
          } ), type: 'container' },
          networth: { value: Parser.container< TMoverSubject >( {
            winner: { value: winner[ 2 ], type: 'money' },
            loser: { value: loser[ 2 ], type: 'money' }
          } ), type: 'container' },
          percent: { value: Parser.container< TMoverSubject >( {
            winner: { value: winner[ 3 ], type: 'pct' },
            loser: { value: loser[ 3 ], type: 'pct' }
          } ), type: 'container' }
        } ), type: 'container' }
      } )
    }, force );
  }

  // --- instantiate ---

  public static getInstance () : IMover {
    return this.instance ??= new Mover();
  }

  // --- factory ---

  public static factory ( date?: any ) : TMoverData {
    return {
      date: Parser.date( date ?? new Date(), 'ymd' )!,
      today: {
        total: { value: 0, percent: 0 },
        networth: { winner: [], loser: [] },
        percent: { winner: [], loser: [] }
      },
      ytd: {
        total: { value: 0, percent: 0 },
        networth: { winner: [], loser: [] },
        percent: { winner: [], loser: [] }
      }
    };
  };

  // --- aggregate mover data ---

  public static aggregate (
    data: TRealtime | undefined, uri: string, name: string, col: TMoverData, total: number = 0
  ) : void {
    if ( data?.today?.value ) {
      const type = data.today.value > 0 ? 'winner' : 'loser';
      col.today.total.value += data.today.value;
      col.today.total.percent = total ? col.today.total.value / total : 0;
      col.today.networth[ type ].push( { uri, name, value: data.today.value } );
      col.today.percent[ type ].push( { uri, name, value: data.today.percent } );
    }

    if ( data?.ytd?.value ) {
      const type = data.ytd.value > 0 ? 'winner' : 'loser';
      col.ytd.total.value += data.ytd.value;
      col.ytd.total.percent = total ? col.ytd.total.value / total : 0;
      col.ytd.networth[ type ].push( { uri, name, value: data.ytd.value } );
      col.ytd.percent[ type ].push( { uri, name, value: data.ytd.percent } );
    }
  }
}
