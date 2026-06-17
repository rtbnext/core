import { join } from 'node:path';
import process, { cwd } from 'node:process';

import type { IConfig } from '@/interface/config';
import type {
  TConfigObject, TFetchConfig, TJobConfig, TLoggingConfig, TQueueConfig, TStorageConfig
} from '@/type/config';


export class Config implements IConfig {
  private static instance: Config;

  private readonly cwd: string;
  private readonly path: string;
  private readonly env: string;
  private readonly cfg: TConfigObject;

  private constructor () {
    this.cwd = cwd();
    this.path = join( this.cwd, 'config' );
    this.env = process.env.NODE_ENV || 'production';
  }

  // --- public getter ---

    public get root () : string { return this.cwd }
    public get environment () : string { return this.env }
    public get config () : TConfigObject { return this.cfg }
    public get logging () : TLoggingConfig { return this.cfg.logging }
    public get job () : TJobConfig { return this.cfg.job }
    public get storage () : TStorageConfig { return this.cfg.storage }
    public get fetch () : TFetchConfig { return this.cfg.fetch }
    public get queue () : TQueueConfig { return this.cfg.queue }

  // --- instantiate ---

  public static getInstance () : Config {
    return Config.instance ||= new Config();
  }
}
