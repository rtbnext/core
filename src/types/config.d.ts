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
