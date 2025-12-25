import { Job, jobRunner } from '@/abstract/Job';
import { Stats } from '@/collection/Stats';
import { TArgs } from '@/types/generic';
import { TRTBSnapshot } from '@/types/list';
import { TProfileData } from '@/types/profile';
import { TRTBResponse } from '@/types/response';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';

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

            const raw = res.data.personList.personsLists;
            const listDate = Parser.date( raw[ 0 ].date || raw[ 0 ].timestamp, 'ymd' )!;
            if ( rtStats.date === listDate ) throw new Error( 'RTB list is already up to date' );

            rtStats.date = listDate;
            const items: TRTBSnapshot[ 'items' ] = [];

            for ( const row of raw ) {
                const profileData = {
                    uri: Utils.sanitize( row.uri ),
                    info: {
                        ...Parser.name( row.personName, row.lastName ),
                        ...Parser.container< Partial< TProfileData[ 'info' ] > >( {
                            dropOff: { value: row.finalWorth < 1e3, method: 'boolean' },
                            gender: { value: row.gender, method: 'gender' },
                            birthDate: { value: row.birthDate, method: 'date' },
                            citizenship: { value: row.countryOfCitizenship, method: 'country' },
                            industry: { value: row.industries[ 0 ], method: 'industry' },
                            source: { value: row.source, method: 'list' }
                        } )
                    }
                };

                const data: TRTBSnapshot[ 'items' ][ number ] = {
                    uri: row.uri,
                    name: row.person?.name ?? row.personName,
                    rank: row.rank,
                    networth: row.finalWorth,
                    gender: row.gender,
                    age: row.birthDate,
                    citizenship: row.countryOfCitizenship,
                    industry: row.industries,
                    source: row.source
                };
            }
        } );
    }

}

jobRunner( UpdateRTB );
