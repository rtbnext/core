import { StorageConfig } from '@/types/config';
import { Logger } from '@/utils/Logger';
import { ConfigLoader } from './ConfigLoader';
import { existsSync, mkdirSync } from 'node:fs';
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

    private resolvePath ( path: string ) : string {
        return join( this.path, path );
    }

    public exists ( path: string ) : boolean {
        return existsSync( this.resolvePath( path ) );
    }

    public assertPath ( path: string ) : void | never {
        if ( ! this.exists( path ) ) throw new Error( `Path ${path} does not exist` );
    }

    public ensurePath ( path: string ) : void {
        mkdirSync( this.resolvePath( path ), { recursive: true } );
    }

    public initDB () : void {
        [ 'profile', 'list', 'filter', 'mover', 'stats' ].forEach( this.ensurePath );
    }

    public static getInstance () : Storage {
        return Storage.instance ||= new Storage();
    }

}
