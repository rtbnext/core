import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { load } from 'js-yaml';

export interface StorageConfig {
    baseDir: string;
    minify: boolean;
};

export class Storage {

    private static instance: Storage;
    private static readonly cwd = process.cwd();

    private readonly config: StorageConfig;

    private constructor () {

        this.config = load( join( Storage.cwd, 'config/storage.yml' ) ) as StorageConfig;

    }

    public static getInstance () : Storage {

        if ( ! Storage.instance ) Storage.instance = new Storage();
        return Storage.instance;

    }

    private pathBuilder ( filePath: string ) : string {

        return join( Storage.cwd, this.config.baseDir, filePath );

    }

    private async saveJson< T = any > ( filePath: string, data: T ) : Promise< void > {

        const jsonData = JSON.stringify( data, null, 2 );
        await writeFile( this.pathBuilder( filePath ), jsonData, 'utf8' );

    }

    private async loadJson< T = any > ( filePath: string ) : Promise< T | false > {

        if ( ! existsSync( filePath ) ) return false;

        const data = await readFile( this.pathBuilder( filePath ), 'utf8' );
        return JSON.parse( data ) as T;

    }

}
