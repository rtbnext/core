export type TLoggingLevel = 'error' | 'warn' | 'info' | 'debug';

export type TLoggingConfig = {
  level: TLoggingLevel;
  console?: boolean;
  file?: boolean;
};

export type TJobConfig = {
  silent: boolean;
  safeMode: boolean;
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
  agentPool: string[];
  rateLimit: {
    batchSize: number;
    timeout: number;
    retries: number;
    requestDelay: {
      max: number;
      min: number;
    };
  };
  requests: {
    list: {
      limitRows: number;
      maxQueries: number;
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
  job: TJobConfig;
  storage: TStorageConfig;
  fetch: TFetchConfig;
  queue: TQueueConfig;
};
