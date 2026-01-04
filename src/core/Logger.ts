import { Config } from '@/core/Config';
import { TLoggingConfig } from '@/types/config';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

export class Logger {

    private static readonly level: Record< TLoggingConfig[ 'level' ], number > = {
        error: 0, warn: 1, info: 2, debug: 3
    };

    private static instance: Logger;
    private readonly config: TLoggingConfig;
    private readonly path: string;

    private constructor () {
        const { root, logging } = Config.getInstance();
        this.config = logging;
        this.path = join( root, 'logs' );
        mkdirSync( this.path, { recursive: true } );
    }

    public static getInstance () : Logger {
        return Logger.instance ||= new Logger();
    }

    private shouldLog ( level: TLoggingConfig[ 'level' ] ) : boolean {
        return Logger.level[ level ] <= Logger.level[ this.config.level ];
    }

}

export const log = Logger.getInstance();
