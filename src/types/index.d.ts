import { IConfig } from '@/interfaces/config';
import { IFetch } from '@/interfaces/fetch';
import { IQueue } from '@/interfaces/queue';
import { IStorage } from '@/interfaces/storage';

export interface TServices {
    readonly config: IConfig;
    readonly fetch: IFetch;
    readonly profileQueue: IQueue;
    readonly listQueue: IQueue;
    readonly storage: IStorage;
}
