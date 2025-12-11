import { Config, LoggingConfig } from '../types/config';

export class ConfigLoader {

    private static instance: ConfigLoader;
    private readonly env: string;
    private readonly cfg: Config;

    private constructor () {
        this.env = process.env.NODE_ENV || 'production';
        this.cfg = {} as Config;
    }

    public get environment () : string { return this.env }
    public get config () : Config { return this.cfg }
    public get logging () : LoggingConfig { return this.cfg.logging }

    public static getInstance () : ConfigLoader {
        return ConfigLoader.instance ||= new ConfigLoader();
    }

}
