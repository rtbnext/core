import { join } from 'node:path';
import process, { cwd } from 'node:process';

import type { IConfig } from '@/interface/config';
import type { TConfigObject } from '@/type/config';


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

  // --- instantiate ---

  public static getInstance () : Config {
    return Config.instance ||= new Config();
  }
}
