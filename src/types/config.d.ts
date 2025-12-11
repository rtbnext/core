export interface FetchConfig {}

export interface StorageConfig {}

export interface LoggingConfig {
    level: 'error' | 'warn' | 'info' | 'debug';
    console?: boolean;
    file?: boolean;
}

export interface ConfigObject {
    fetch: FetchConfig;
    storage: StorageConfig;
    logging: LoggingConfig;
}
