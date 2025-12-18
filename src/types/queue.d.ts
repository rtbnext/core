export interface TQueue {
    profile: TQueueItem[];
    list: TQueueItem[];
}

export interface TQueueItem {
    uri: string;
    ts: string;
    prio?: number;
}
