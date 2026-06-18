import type { TStorageConfig } from '@/type/config';


export class Storage {
  private static instance: Storage;

  private readonly config: TStorageConfig;
  private readonly path: string;
}
