export type TLoggingLevel = 'error' | 'warn' | 'info' | 'debug';

export type TLoggingConfig = {
  level: TLoggingLevel;
  console?: boolean;
  file?: boolean;
};
