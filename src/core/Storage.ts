import { StorageConfig } from '@/types/config';
import { Logger } from '@/utils/Logger';
import { ConfigLoader } from './ConfigLoader';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

export class Storage {

    private static instance: Storage;
    private readonly logger: Logger;
    private readonly config: StorageConfig;
    private readonly path: string;

    private constructor () {
        this.logger = Logger.getInstance();
        this.config = ConfigLoader.getInstance().storage;
        this.path = join( cwd(), this.config.baseDir );
        this.initDB();
    }

    public initDB () : void {
        [ 'profile', 'list', 'filter', 'mover', 'stats' ].forEach(
            dir => mkdirSync( join( this.path, dir ), { recursive: true } )
        );
    }

    public static getInstance () : Storage {
        return Storage.instance ||= new Storage();
    }

}
