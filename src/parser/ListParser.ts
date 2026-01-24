import { TAsset, TRealtime } from '@rtbnext/schema/src/abstract/assets';
import { TProfileBio, TProfileData, TProfileInfo } from '@rtbnext/schema/src/model/profile';

import { Cache } from '@/abstract/Cache';
import { Utils } from '@/core/Utils';
import { IListParser } from '@/interfaces/parser';
import { Parser } from '@/parser/Parser';
import { ProfileParser } from '@/parser/ProfileParser';
import { TParsedProfileName } from '@/types/parser';
import { TListResponseEntry } from '@/types/response';

export class ListParser extends Cache implements IListParser {

    private readonly raw: TListResponseEntry;

    constructor ( raw: TListResponseEntry ) {
        super();

        this.raw = raw;
    }

    // Raw data

    public rawData () : TListResponseEntry {
        return this.raw;
    }

    // URIs & IDs

    public uri () : string {
        return this.cache( 'uri', () => Utils.sanitize( this.raw.uri ) );
    }

    public id () : string {
        return this.cache( 'id', () => Utils.hash( this.raw.naturalId ) );
    }

    // Parse basic fields

    public date () : string {
        return this.cache( 'date', () =>
            Parser.date( this.raw.date || this.raw.timestamp, 'ymd' )!
        );
    }

    public rank () : number | undefined {
        return this.cache( 'rank', () => Parser.strict( this.raw.rank, 'number' ) );
    }

    public networth () : number | undefined {
        return this.cache( 'networth', () =>
            Parser.strict( this.raw.finalWorth, 'money' )
        );
    }

    public dropOff () : boolean | undefined {
        return this.cache( 'dropOff', () =>
            this.raw.finalWorth ? this.raw.finalWorth < 1e3 : undefined
        );
    }

    public name () : TParsedProfileName {
        return this.cache( 'name', () => ProfileParser.name(
            this.raw.person?.name ?? this.raw.personName, this.raw.lastName
        ) );
    }

    // (Partial) profile data

    public info () : Partial< TProfileInfo > {
        return this.cache( 'info', () => Parser.container< Partial< TProfileInfo > >( {
            dropOff: { value: this.dropOff(), type: 'boolean' },
            gender: { value: this.raw.gender, type: 'gender' },
            birthDate: { value: this.raw.birthDate, type: 'date' },
            citizenship: { value: this.raw.countryOfCitizenship, type: 'country' },
            industry: { value: this.raw.industries?.[ 0 ], type: 'industry' },
            source: { value: this.raw.source, type: 'list' }
        } ) );
    }

    public bio () : TProfileBio {
        return this.cache( 'bio', () => Parser.container< TProfileBio >( {
            cv: { value: this.raw.bios, type: 'list', args: [ 'safeStr' ] },
            facts: { value: this.raw.abouts, type: 'list', args: [ 'safeStr' ] },
            quotes: { value: [], type: 'list', args: [ 'safeStr' ] }
        } ) );
    }

    public age () : number | undefined {
        return this.cache( 'age', () => Parser.strict( this.raw.birthDate, 'age' ) );
    }

    // Financial assets

    public assets () : TAsset[] {
        return this.cache( 'assets', () => ( this.raw.financialAssets ?? [] )
            .map( a => ( {
                ...Parser.container< TAsset >( {
                    type: { value: 'public', type: 'string' },
                    label: { value: a.companyName, type: 'string' },
                    value: { value: a.numberOfShares && ( a.currentPrice || a.sharePrice )
                        ? a.numberOfShares * ( a.currentPrice ?? a.sharePrice )! / 1e6
                        : undefined, type: 'money' }
                } ),
                info: Parser.container< TAsset[ 'info' ] >( {
                    exchange: { value: a.exchange, type: 'string' },
                    ticker: { value: a.ticker, type: 'string' },
                    shares: { value: a.numberOfShares, type: 'number' },
                    price: { value: a.currentPrice ?? a.sharePrice, type: 'number', args: [ 6 ] },
                    currency: { value: a.currencyCode, type: 'string' },
                    exRate: { value: a.exchangeRate, type: 'number', args: [ 6 ] }
                } )
            } ) )
        );
    }

    // Realtime data

    public realtime (
        data?: Partial< TProfileData >, prev?: string, next?: string
    ) : TRealtime | undefined {
        return this.cache( 'realtime', () => {
            if ( ! this.raw.finalWorth ) return;
            const lastDay = data?.realtime?.networth ?? 0;
            const dailyChange = this.raw.finalWorth - lastDay;
            const lastYear = data?.annual?.sort( ( a, b ) => b.year - a.year )?.[ 0 ]?.networth?.last ?? 0;
            const ytdChange = this.raw.finalWorth - lastYear;

            return {
                date: this.date(), rank: this.rank(), networth: this.networth(), prev, next,
                today: data && data.realtime && lastDay ? {
                    value: Parser.money( dailyChange ),
                    pct: Parser.pct( dailyChange / lastDay * 100 )
                } : undefined,
                ytd: data && data.annual?.length && lastYear ? {
                    value: Parser.money( ytdChange ),
                    pct: Parser.pct( ytdChange / lastYear * 100 )
                } : undefined
            };
        } );
    }

}
