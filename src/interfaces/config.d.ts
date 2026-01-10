import * as Conf from '@/types/config';

export interface IConfig {
    root: string;
    environment: string;
    config: Conf.TConfigObject;
    logging: Conf.TLoggingConfig;
    job: Conf.TJobConfig;
    storage: Conf.TStorageConfig;
    fetch: Conf.TFetchConfig;
    queue: Conf.TQueueConfig;
}
