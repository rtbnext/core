import { TListStats } from '@/types/list';

export type TStatsItem = TListStats & {
    first: {
        readonly uri: string;
        name: string;
        rank: number;
        networth: number;
    };
};

export interface TStats< T extends string > {
    index: TMetaData & { [ K in T ]: TStatsItem };
    history: { [ K in T ]: TStatsHistory };
}

export interface TStatsCollection {
    industry: TStats< string >;
    citizenship: TStats< string >;
}

export interface TScatterItem {
    readonly uri: string;
    name: string;
    gender: Gender;
    age: number;
    networth: number;
}

export type TScatter = TScatterItem[];
