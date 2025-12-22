import { Config } from '@/core/Config';
import { Fetch } from '@/core/Fetch';
import { Queue } from '@/core/Queue';
import { Storage } from '@/core/Storage';

const service = {
    config: Config.getInstance,
    fetch: Fetch.getInstance,
    queue: Queue.getInstance,
    storage: Storage.getInstance
} as const;

export { Config, Fetch, Queue, Storage };
export default service;
