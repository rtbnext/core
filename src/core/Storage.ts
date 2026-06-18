import { join } from 'node:path';

import { Config } from '@/core/Config';
import type { IStorage } from '@/interface/storage';
import type { TStorageConfig } from '@/type/config';


export class Storage implements IStorage {
  private static instance: Storage;

  private readonly config: TStorageConfig;
  private readonly path: string;

   private constructor () {
    const { root, storage } = Config.getInstance();
    this.config = storage;
    this.path = join( root, this.config.baseDir );
  }

  // --- instantiate ---

  public static getInstance () : IStorage {
    return Storage.instance ||= new Storage();
  }
}
