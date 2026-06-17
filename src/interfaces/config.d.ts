import type { TConfigObject, TFetchConfig, TJobConfig, TLoggingConfig, TQueueConfig, TStorageConfig } from '@/type/config';


export interface IConfig {
  root: string;
  environment: string;
  config: TConfigObject;
  logging: TLoggingConfig;
  job: TJobConfig;
  storage: TStorageConfig;
  fetch: TFetchConfig;
  queue: TQueueConfig;
}
