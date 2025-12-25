import { TProfileData } from '@/types/profile';
import { TListResponse } from '@/types/response';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';

export class ListParser {

    constructor ( private readonly raw: TListResponse[ 'personList' ][ 'personsLists' ][ number ] ) {}

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

}
