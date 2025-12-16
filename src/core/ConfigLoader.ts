import * as config from '@/types/config';
import { Utils } from '@/utils/Utils';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import deepmerge from 'deepmerge';
import { parse } from 'yaml';

export class ConfigLoader {

    private static instance: ConfigLoader;
    private readonly cwd: string;
    private readonly path: string;
    private readonly env: string;
    private readonly cfg: config.TConfigObject;

    private constructor () {
        this.cwd = cwd();
        this.path = join( this.cwd, 'config' );
        this.env = process.env.NODE_ENV || 'production';
        this.cfg = this.loadConfig();
    }

    private loadConfigFile ( path: string ) : Partial< config.TConfigObject > {
        if ( ! existsSync( path = join( this.path, path ) ) ) return {};
        try { return parse( readFileSync( path, 'utf8' ) ) as Partial< config.TConfigObject > }
        catch { return {} }
    }

    private loadConfig () : config.TConfigObject {
        return deepmerge< config.TConfigObject >(
            this.loadConfigFile( 'default.yml' ), this.loadConfigFile( `${this.env}.yml` ),
            { arrayMerge: ( t, s ) => Utils.mergeArray( t, s, 'replace' ) }
        );
    }

    public get root () : string { return this.cwd }
    public get environment () : string { return this.env }
    public get config () : config.TConfigObject { return this.cfg }
    public get fetch () : config.TFetchConfig { return this.cfg.fetch }
    public get storage () : config.TStorageConfig { return this.cfg.storage }
    public get logging () : config.TLoggingConfig { return this.cfg.logging }

    public static getInstance () : ConfigLoader {
        return ConfigLoader.instance ||= new ConfigLoader();
    }

}
