import * as Conf from '@/types/config';

export interface IConfig {
    root: string;
    environment: string;
    config: Conf.TConfigObject;
    logging: Conf.TLoggingConfig;
    storage: Conf.TStorageConfig;
    fetch: Conf.TFetchConfig;
    queue: Conf.TQueueConfig;
}
