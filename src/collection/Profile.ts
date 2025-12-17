import { TProfileData } from '@/types/profile';
import { TProfileResponse } from '@/types/response';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';

export class Profile {

    public static parser ( raw: TProfileResponse[ 'person' ] ) : Partial< TProfileData > {
        return {
            ...Parser.container< TProfileData >( {} ),
            uri: Utils.sanitize( raw.uri )
        };
    }

}
