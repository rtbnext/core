import { ConfigLoader } from '@/core/ConfigLoader';
import { Fetch } from '@/core/Fetch';
import { Queue } from '@/core/Queue';
import { Storage } from '@/core/Storage';

const service = {
    config: ConfigLoader.getInstance,
    fetch: Fetch.getInstance,
    queue: Queue.getInstance,
    storage: Storage.getInstance
} as const;

export { ConfigLoader, Fetch, Queue, Storage };
export default service;
