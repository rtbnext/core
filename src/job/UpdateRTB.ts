import { Job, jobRunner } from '@/abstract/Job';
import { Stats } from '@/collection/Stats';
import { TRTBItem } from '@/types/list';
import { TListResponse } from '@/types/response';
import { ListParser } from '@/utils/ListParser';
import { Parser } from '@/utils/Parser';

export class UpdateRTB extends Job {

    private readonly stats = Stats.getInstance();

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'UpdateRTB' );
    }

    public async run () : Promise< void > {
        await this.protect( async () => {
            const rtStats = this.stats.getRealtime();
            const res = await this.fetch.list< TListResponse >( 'rtb', '0' );
            if ( ! res?.success || ! res.data ) throw new Error( 'Request failed' );

            const raw = res.data.personList.personsLists;
            const listDate = Parser.date( raw[ 0 ].date || raw[ 0 ].timestamp, 'ymd' )!;
            if ( rtStats.date === listDate ) throw new Error( 'RTB list is already up to date' );

            const items: TRTBItem[] = [];
            let count = 0, woman = 0, total = 0;

            for ( const row of raw ) {
                const parser = new ListParser( row );

                const rank = parser.rank();
                const networth = parser.networth();
                if ( ! rank || ! networth ) continue;

                const uri = parser.uri();
                const id = parser.id();
                const profileData = {
                    uri, id, info: parser.info(), bio: parser.bio(),
                    assets: parser.assets()
                };

                // process profiles ...

                items.push( {
                    uri, rank, networth,
                    name: '',
                    gender: profileData.info.gender,
                    age: parser.age(),
                    citizenship: profileData.info.citizenship,
                    industry: profileData.info.industry!,
                    source: profileData.info.source!
                } );

                count++;
                woman += +( profileData.info.gender === 'f' );
                total += networth;
            }

            rtStats.date = listDate;
            rtStats.count = Parser.number( count );
            rtStats.totalWealth = Parser.money( total );
            rtStats.womanCount = Parser.number( woman );
            this.stats.setRealtime( rtStats );
        } );
    }

}

jobRunner( UpdateRTB );
