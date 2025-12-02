import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'js-yaml';

export class Config {

    private static readonly cwd = process.cwd();
    private static readonly dir = 'config';

    public static load< T > ( cfg: string ) : T | undefined {

        const path = join( Config.cwd, Config.dir, cfg + '.yml' );

        if ( ! existsSync( path ) ) return undefined;
        return load( path ) as T;

    }

}
