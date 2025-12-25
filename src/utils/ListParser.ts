import { TAsset } from '@/types/generic';
import { TProfileData } from '@/types/profile';
import { TListResponse } from '@/types/response';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';

export class ListParser {

    constructor ( private readonly raw: TListResponse[ 'personList' ][ 'personsLists' ][ number ] ) {}

    public rank () : number | undefined {
        return Parser.strict( this.raw.rank, 'number' );
    }

    public networth () : number | undefined {
        return Parser.strict( this.raw.finalWorth, 'money' );
    }

    public uri () : string {
        return Utils.sanitize( this.raw.uri );
    }

    public id () : string {
        return Utils.hash( this.raw.naturalId );
    }

    public name () : ReturnType< typeof Parser.name > {
        return Parser.name( this.raw.person?.name ?? this.raw.personName, this.raw.lastName );
    }

    public info () : Partial< TProfileData[ 'info' ] > {
        return Parser.container< Partial< TProfileData[ 'info' ] > >( {
            dropOff: { value: this.raw.finalWorth ? this.raw.finalWorth < 1e3 : undefined, method: 'boolean' },
            gender: { value: this.raw.gender, method: 'gender' },
            birthDate: { value: this.raw.birthDate, method: 'date' },
            citizenship: { value: this.raw.countryOfCitizenship, method: 'country' },
            industry: { value: this.raw.industries?.[ 0 ], method: 'industry' },
            source: { value: this.raw.source, method: 'list' }
        } );
    }

    public bio () : TProfileData[ 'bio' ] {
        return Parser.container< TProfileData[ 'bio' ] >( {
            cv: { value: this.raw.bios, method: 'list' },
            facts: { value: this.raw.abouts, method: 'list' },
            quotes: { value: [], method: 'list' }
        } );
    }

    public age () : number | undefined {
        return Parser.strict( this.raw.birthDate, 'age' );
    }

    public assets () : TAsset[] {
        return ( this.raw.financialAssets ?? [] ).map( a => ( {
            ...Parser.container< TAsset >( {
                type: { value: 'public', method: 'string' },
                label: { value: a.companyName, method: 'string' },
                value: { value: a.numberOfShares && a.currentPrice
                    ? a.numberOfShares * a.currentPrice
                    : undefined, method: 'money' }
            } ),
            info: Parser.container< TAsset[ 'info' ] >( {
                exchange: { value: a.exchange, method: 'string' },
                ticker: { value: a.ticker, method: 'string' },
                shares: { value: a.numberOfShares, method: 'number' },
                price: { value: a.currentPrice ?? a.sharePrice, method: 'number', args: [ 6 ] },
                currency: { value: a.currencyCode, method: 'string' },
                exRate: { value: a.exchangeRate, method: 'number', args: [ 6 ] }
            } )
        } ) );
    }

}
