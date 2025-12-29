export type TFilter = string[];

export interface TFilterCollection {
    industry: Record< string, TFilter >;
    country: Record< string, TFilter >;
    state: Record< string, TFilter >;
    special: {
        gender: TFilter;
        deceased: TFilter;
        dropOff: TFilter;
        family: TFilter;
    };
}
