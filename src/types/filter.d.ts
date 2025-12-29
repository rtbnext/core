import { Gender, MaritalStatus } from '@/utils/Const';

export interface TFilter {
    readonly uri: string;
    name: string;
}

export interface TFilterCollection {
    industry: Record< string, TFilter[] >;
    citizenship: Record< string, TFilter[] >;
    country: Record< string, TFilter[] >;
    state: Record< string, TFilter[] >;
    gender: Partial< Record< Gender, TFilter[] > >;
    age: Partial< Record< number, TFilter[] > >;
    maritalStatus: Partial< Record< MaritalStatus, TFilter[] > >;
    special: {
        deceased: TFilter[];
        dropOff: TFilter[];
        family: TFilter[];
        selfMade: TFilter[];
    };
}
