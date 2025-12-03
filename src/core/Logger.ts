import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Config } from './Config';

export class Logger {

    private static instance: Logger;

    private constructor () {

        const config = Config.getInstance().getLoggingConfig();
        mkdirSync( join( Config.cwd, config.logDir ), { recursive: true } );

    }

    public static getInstance () : Logger {

        if ( ! Logger.instance ) Logger.instance = new Logger();
        return Logger.instance;

    }

}
