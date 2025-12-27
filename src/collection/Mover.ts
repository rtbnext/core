import { Dated } from '@/abstract/Dated';
import { TMover, TMoverEntry } from '@/types/mover';

export class Mover extends Dated< TMover > {

    private static instance: Mover;

    private constructor () {
        super( 'mover' );
    }

    private prep ( arr: TMoverEntry[], dir: 'asc' | 'desc' = 'asc' ) : TMoverEntry[] {
        return arr.sort( ( a, b ) => dir === 'asc' ? a.value - b.value : b.value - a.value ).slice( 0, 10 );
    }

    public saveSnapshot ( snapshot: TMover, force?: boolean ) : boolean {
        const { today, ytd } = snapshot;
        const w = [ today.networth.winner, today.percent.winner, ytd.networth.winner, ytd.percent.winner ].map( a => this.prep( a, 'desc' ) );
        const l = [ today.networth.loser, today.percent.loser, ytd.networth.loser, ytd.percent.loser ].map( a => this.prep( a, 'asc' ) );

        return super.saveSnapshot( {
            date: snapshot.date,
            today: { networth: { winner: w[ 0 ], loser: l[ 0 ] }, percent: { winner: w[ 1 ], loser: l[ 1 ] } },
            ytd: { networth: { winner: w[ 2 ], loser: l[ 2 ] }, percent: { winner: w[ 3 ], loser: l[ 3 ] } }
        } );
    }

    public static getInstance () : Mover {
        return this.instance ||= new Mover();
    }

}
