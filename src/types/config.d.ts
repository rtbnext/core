export interface TLoggingConfig {}

export interface TStorageConfig {}

export interface TFetchConfig {}

export interface TQueueConfig {}

export interface TConfigObject {
    logging: TLoggingConfig;
    storage: TStorageConfig;
    fetch: TFetchConfig;
    queue: TQueueConfig;
}
