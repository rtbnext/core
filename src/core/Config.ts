import type { IConfig } from '@/interface/config';
import type { TConfigObject } from '@/type/config';


export class Config implements IConfig {
  private static instance: Config;

  private readonly cwd: string;
  private readonly path: string;
  private readonly env: string;
  private readonly cfg: TConfigObject;

  private constructor () {}
}
