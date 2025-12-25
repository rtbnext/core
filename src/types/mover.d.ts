export interface TMoverEntry {
    readonly uri: string;
    name: string;
    value: number;
}

export interface TMoverSubject {
    winner: MoverEntry[];
    loser: MoverEntry[];
}

export interface TMoverItem {
    networth: TMoverSubject;
    percent: TMoverSubject;
}

export interface TMover {
    date: string;
    today: TMoverItem;
    ytd: TMoverItem;
}
