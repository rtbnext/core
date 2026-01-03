import { Config } from '@/core/Config';
import { TStorageConfig } from '@/types/config';
import { join } from 'node:path';

export class Storage {

    private static instance: Storage;
    private static readonly config: TStorageConfig = Config.getInstance().storage;

    private readonly path: string;

    private constructor () {
        this.path = join( Config.getInstance().root, Storage.config.baseDir );
    }

    public static getInstance () : Storage {
        return Storage.instance ||= new Storage();
    }

}
