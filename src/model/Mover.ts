import type { TChangeItem, TRealtime } from '@rtbnext/schema/src/base/assets';
import type { TMover, TMoverBucket, TMoverData, TMoverEntry, TMoverItem } from '@rtbnext/schema/src/model/mover';

import { Snapshot } from '@/abstract/Snapshot';
import { Utils } from '@/core/Utils';
import type { IMover } from '@/interface/mover';
import { Parser } from '@/parser/Parser';


export class Mover extends Snapshot< TMover > implements IMover {
  private static instance: Mover;
  private constructor () { super( 'mover' ) }

  // --- parse mover items ---

  private prepItems ( items: TMoverItem[], method: 'money' | 'pct', dir: 'asc' | 'desc' ) : TMoverItem[] {
    return items.sort( ( a, b ) => dir === 'asc' ? a.value - b.value : b.value - a.value ).slice( 0, 10 ).map(
      ( { uri, name, value } ) => ( { uri, name, value: Parser[ method ]( value ) } )
    );
  }

  private parseEntry ( entry: TMoverEntry, method: 'money' | 'pct' ) : TMoverEntry {
    return {
      winner: this.prepItems( entry.winner, method, 'desc' ),
      loser: this.prepItems( entry.loser, method, 'asc' )
    };
  }

  private parseBucket ( bucket: TMoverBucket ) : TMoverBucket {
    return {
      total: Parser.container< TChangeItem >( {
        value: { value: bucket.total.value, type: 'money' },
        percent: { value: bucket.total.percent, type: 'pct' }
      } ),
      networth: this.parseEntry( bucket.networth, 'money' ),
      percent: this.parseEntry( bucket.percent, 'pct' )
    };
  }

  // --- (override) save mover snapshot ---

  public override saveSnapshot ( snapshot: TMoverData, force?: boolean ) : boolean {
    return super.saveSnapshot( {
      ...Utils.metaData(),
      date: Parser.date( snapshot.date )!,
      today: this.parseBucket( snapshot.today ),
      ytd: this.parseBucket( snapshot.ytd )
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
  }

  // --- aggregate mover data ---

  public static aggregate (
    data: TRealtime | undefined, uri: string, name: string, mover: TMoverData, total: number = 0
  ) : void {
    if ( data?.today?.value ) {
      const type = data.today.value > 0 ? 'winner' : 'loser';
      mover.today.total.value += data.today.value;
      mover.today.total.percent = total ? mover.today.total.value / total * 100 : 0;
      mover.today.networth[ type ].push( { uri, name, value: data.today.value } );
      mover.today.percent[ type ].push( { uri, name, value: data.today.percent } );
    }

    if ( data?.ytd?.value ) {
      const type = data.ytd.value > 0 ? 'winner' : 'loser';
      mover.ytd.total.value += data.ytd.value;
      mover.ytd.total.percent = total ? mover.ytd.total.value / total * 100 : 0;
      mover.ytd.networth[ type ].push( { uri, name, value: data.ytd.value } );
      mover.ytd.percent[ type ].push( { uri, name, value: data.ytd.percent } );
    }
  }
}
