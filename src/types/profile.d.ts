export type TProfileIndex< T extends string = string > = Map< T, TProfileIndexItem< T > >;

export interface TProfileIndexItem< T extends string = string > {
    uri: T;
    name: string;
    aliases: string[];
    text: string;
};
