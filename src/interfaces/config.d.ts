import type {
  TConfigObject, TCronConfig, TFetchConfig, TJobConfig, TLoggingConfig,
  TQueueConfig, TStorageConfig
} from '@/type/config';


export interface IConfig {
  root: string;
  environment: string;
  config: TConfigObject;
  logging: TLoggingConfig;
  job: TJobConfig;
  cron: TCronConfig;
  storage: TStorageConfig;
  fetch: TFetchConfig;
  queue: TQueueConfig;
}
