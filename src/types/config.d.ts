export interface TFetchConfig {
    baseUrl: string;
    endpoints: {
        profile: string;
        list: string;
    };
    headers: Record< string, string >;
    agentPool: string[];
    rateLimit: {
        maxBatchSize: number;
        timeout: number;
        retries: number;
        requestDelay: {
            max: number;
            min: number;
        };
    };
}

export interface TStorageConfig {
    baseDir: string;
    compressing: boolean;
}

export interface TLoggingConfig {
    level: 'error' | 'warn' | 'info' | 'debug';
    console?: boolean;
    file?: boolean;
}

export interface TConfigObject {
    fetch: TFetchConfig;
    storage: TStorageConfig;
    logging: TLoggingConfig;
}
