import { LoggingConfig } from '../types/config';
import { ConfigLoader } from './ConfigLoader';

export class Logger {

    private static instance: Logger;
    private readonly config: LoggingConfig;

    private constructor () {
        this.config = ConfigLoader.getInstance().logging;
    }

    private format () {}

    private log () {}

    public error () {}

    public exit () {}

    public warn () {}

    public info () {}

    public debug () {}

    public static getInstance () : Logger {
        return Logger.instance ||= new Logger();
    }

}
