export interface LoggingConfig {
    level: 'error' | 'warn' | 'info' | 'debug';
    file?: boolean;
    console?: boolean;
}

export interface Config {
    logging: LoggingConfig;
}
