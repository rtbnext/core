import type { TService } from '@rtbnext/schema/src/base/const';

export type TLoggingLevel = 'error' | 'warn' | 'info' | 'debug';

export type TLoggingConfig = {
  level: TLoggingLevel;
  console?: boolean;
  file?: boolean;
};

export type TStatusConfig = {
  maintenance?: TService[];
};

export type TJobConfig = {
  silent: boolean;
  safeMode: boolean;
};

export type TCronConfig = {
  timezone: string;
  jitter: number;
};

export type TStorageConfig = {
  baseDir: string;
  compression: boolean;
};

export type TFetchConfig = {
  endpoints: {
    profile: string;
    list: string;
    wikipedia: string;
    commons: string;
    wikidata: string;
    wayback: string;
  };
  headers: Record< string, string >;
  apiAgent: string;
  agentPool: string[];
  rateLimit: {
    batchSize: number;
    timeout: number;
    retries: number;
    idle: number;
    requestDelay: {
      max: number;
      min: number;
    };
  };
  requests: {
    list: {
      chunkSize: number;
      maxRequests: number;
    };
  };
};

export type TQueueConfig = {
  tsThreshold: number;
  maxSize: number;
  defaultPrio: number;
};

export type TConfigObject = {
  logging: TLoggingConfig;
  status: TStatusConfig;
  job: TJobConfig;
  cron: TCronConfig;
  storage: TStorageConfig;
  fetch: TFetchConfig;
  queue: TQueueConfig;
};
