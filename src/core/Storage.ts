import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { Config, ConfigObject } from './Config';

export class Storage {

    private static instance: Storage;
    private readonly config: ConfigObject[ 'storage' ];

    private constructor () {

        this.config = Config.getInstance().getStorageConfig();
        this.initDB();

    }

    public static getInstance () : Storage {

        if ( ! Storage.instance ) Storage.instance = new Storage();
        return Storage.instance;

    }

    private pathBuilder ( path: string, ext?: 'json' | 'csv' ) : string {

        path = path.replace( /(.json|.csv)/g, '' );
        if ( this.config.fileExtensions && ext ) path += `.${ext}`;

        return join( Config.cwd, this.config.baseDir, path );

    }

    public scanDir ( path: string, recursive = true ) : string[] {

        const fullPath = this.pathBuilder( path );
        if ( ! existsSync( fullPath ) ) return [];

        return [ ...readdirSync( fullPath, { recursive } ) ] as string[];

    }

    public saveJson< T extends {} = any > ( path: string, data: T ) : void {

        const fullPath = this.pathBuilder( path, 'json' );
        const content = JSON.stringify( data, null, this.config.compression ? undefined : 2 );
        writeFileSync( fullPath, content, 'utf8' );

    }

    public loadJson< T = any > ( path: string ) : T | undefined {

        const fullPath = this.pathBuilder( path, 'json' );
        if ( ! existsSync( fullPath ) ) return;

        const content = readFileSync( fullPath, 'utf8' );
        return JSON.parse( content ) as T;

    }

    public saveCSV< T extends [] = any > ( path: string, data: T ) : void {

        const fullPath = this.pathBuilder( path, 'csv' );
        const content = stringify( data, { delimiter: this.config.csvDelimiter } ) as unknown as string;
        writeFileSync( fullPath, content, 'utf8' );

    }

    public loadCSV< T = any > ( path: string ) : T | undefined {

        const fullPath = this.pathBuilder( path, 'csv' );
        if ( ! existsSync( fullPath ) ) return;

        const content = readFileSync( fullPath, 'utf8' );
        return parse( content, { bom: true, delimiter: this.config.csvDelimiter } ) as T;

    }

    public initDB () {

        [ 'profile', 'list', 'mover', 'filter', 'stats' ].forEach (
            d => mkdirSync( this.pathBuilder( d ), { recursive: true } )
        );

    }

}
