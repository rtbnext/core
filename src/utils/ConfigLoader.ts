import { Config, LoggingConfig } from '../types/config';

export class ConfigLoader {

    private static instance: ConfigLoader;
    private readonly config: Config;

    private constructor () {
        this.config = {} as Config;
    }

    public get logging () : LoggingConfig { return this.config.logging; }

    public static getInstance () : ConfigLoader {
        return ConfigLoader.instance ||= new ConfigLoader();
    }

}
