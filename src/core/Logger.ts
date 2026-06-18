import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { Config } from '@/core/Config';
import type { ILogger } from '@/interface/logger';
import type { TLoggingConfig } from '@/type/config';


export class Logger implements ILogger {
  private static instance: Logger;

  private readonly config: TLoggingConfig;
  private readonly path: string;

  private constructor () {
    const { root, logging } = Config.getInstance();
    this.config = logging;
    this.path = join( root, 'logs' );
    mkdirSync( this.path, { recursive: true } );
  }

  // --- instantiate ---

  public static getInstance () : ILogger {
    return Logger.instance ||= new Logger();
  }
}
