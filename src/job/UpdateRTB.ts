import { Job, jobRunner } from '@/abstract/Job';
import { Stats } from '@/collection/Stats';
import { TArgs } from '@/types/generic';
import { TRTBResponse } from '@/types/response';
import { Parser } from '@/utils';

export class UpdateRTB extends Job {

    private readonly stats = Stats.getInstance();

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'UpdateRTB' );
    }

    public async run ( args: TArgs ) : Promise< void > {
        await this.protect( async () => {
            const rtStats = this.stats.rt();
            const res = await this.fetch.list< TRTBResponse >( 'rtb', '0' );
            if ( ! res?.success || ! res.data ) throw new Error( 'Request failed' );

            const data = res.data.personList.personsLists;
            const listDate = Parser.date( data[ 0 ].date || data[ 0 ].timestamp, 'ymd' )!;
            if ( rtStats.date === listDate ) throw new Error( 'RTB list is already up to date' );

            rtStats.date = listDate;
        } );
    }

}

jobRunner( UpdateRTB );
