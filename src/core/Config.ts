import { Utils } from '@/core/Utils';
import { TConfigObject, TFetchConfig, TLoggingConfig, TQueueConfig, TStorageConfig } from '@/types/config';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process, { cwd } from 'node:process';
import deepmerge from 'deepmerge';
import { parse } from 'yaml';

export class Config {

    private static instance: Config;
    private readonly cwd: string;
    private readonly path: string;
    private readonly env: string;
    private readonly cfg: TConfigObject;

    private constructor () {
        this.cwd = cwd();
        this.path = join( this.cwd, 'config' );
        this.env = process.env.NODE_ENV || 'production';
        this.cfg = this.loadConfig();
    }

    // Load config

    private loadConfigFile ( path: string ) : Partial< TConfigObject > {
        if ( ! existsSync( path = join( this.path, path ) ) ) return {};
        try { return parse( readFileSync( path, 'utf8' ) ) as Partial< TConfigObject > }
        catch { return {} }
    }

    private loadConfig () : TConfigObject {
        return deepmerge< TConfigObject >(
            this.loadConfigFile( 'default.yml' ), this.loadConfigFile( `${this.env}.yml` ),
            { arrayMerge: ( t, s ) => Utils.mergeArray( t, s, 'replace' ) }
        );
    }

    // Public getter

    public get root () : string { return this.cwd }
    public get environment () : string { return this.env }
    public get config () : TConfigObject { return this.cfg }
    public get logging () : TLoggingConfig { return this.cfg.logging }
    public get storage () : TStorageConfig { return this.cfg.storage }
    public get fetch () : TFetchConfig { return this.cfg.fetch }
    public get queue () : TQueueConfig { return this.cfg.queue }

    // Instantiate

    public static getInstance () : Config {
        return Config.instance ||= new Config();
    }

}
