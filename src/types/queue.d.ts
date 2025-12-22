import { QueueType } from '@/utils/Const';

export interface TQueueItem {
    uri: string;
    ts: string;
    prio?: number;
}

export type TQueue = { [ K in QueueType ]: Map< string, TQueueItem > };

export type TQueueStorage = { [ K in QueueType ]: TQueueItem[] };
