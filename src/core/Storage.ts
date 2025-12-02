import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { Config } from './Config';

export interface StorageConfig {
    baseDir: string;
    minify: boolean;
};

export class Storage {

    private static instance: Storage;
    private static readonly cwd = process.cwd();
    private readonly config: StorageConfig;

    private constructor () {

        this.config = Config.load< StorageConfig >( 'storage' )!;

    }

    public static getInstance () : Storage {

        if ( ! Storage.instance ) Storage.instance = new Storage();
        return Storage.instance;

    }

    private pathBuilder ( path: string ) : string {

        return join( Storage.cwd, this.config.baseDir, path );

    }

    private async saveJson< T = any > ( path: string, data: T ) : Promise< void > {

        const jsonData = JSON.stringify( data, null, this.config.minify ? undefined : 2 );
        await writeFile( this.pathBuilder( path ), jsonData, 'utf8' );

    }

    private async loadJson< T = any > ( path: string ) : Promise< T | false > {

        if ( ! existsSync( path ) ) return false;

        const data = await readFile( this.pathBuilder( path ), 'utf8' );
        return JSON.parse( data ) as T;

    }

}
