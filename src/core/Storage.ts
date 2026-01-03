import { Config } from '@/core/Config';
import { TStorageConfig } from '@/types/config';
import { join } from 'node:path';

export class Storage {

    private static instance: Storage;

    private readonly config: TStorageConfig = Config.getInstance().storage;
    private readonly path: string;

    private constructor () {
        const { root, storage } = Config.getInstance();
        this.config = storage;
        this.path = join( root, this.config.baseDir );
    }

    public static getInstance () : Storage {
        return Storage.instance ||= new Storage();
    }

}
