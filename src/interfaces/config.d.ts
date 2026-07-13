import type {
  TConfigObject, TCronConfig, TFetchConfig, TJobConfig, TLoggingConfig,
  TQueueConfig, TStatusConfig, TStorageConfig
} from '@/type/config';


export interface IConfig {
  root: string;
  environment: string;
  config: TConfigObject;
  logging: TLoggingConfig;
  status: TStatusConfig;
  job: TJobConfig;
  cron: TCronConfig;
  storage: TStorageConfig;
  fetch: TFetchConfig;
  queue: TQueueConfig;
}
