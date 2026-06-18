import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { Config } from '@/core/Config';
import { Utils } from '@/core/Utils';
import type { ILogger } from '@/interface/logger';
import type { TLoggingConfig, TLoggingLevel } from '@/type/config';


export class Logger implements ILogger {
  private static instance: Logger;

  private static readonly LEVEL: Record< TLoggingLevel, number > = {
    error: 0, warn: 1, info: 2, debug: 3
  };

  private readonly config: TLoggingConfig;
  private readonly path: string;

  private constructor () {
    const { root, logging } = Config.getInstance();
    this.config = logging;
    this.path = join( root, 'logs' );
    mkdirSync( this.path, { recursive: true } );
  }

  // --- helper ---

  private shouldLog ( level: TLoggingLevel ) : boolean {
    return Logger.LEVEL[ level ] <= Logger.LEVEL[ this.config.level ];
  }

  private format ( level: TLoggingLevel, label: string, msg: string, meta?: any ) : string {
    const entry = `[${ Utils.date( 'iso' ) }] [${ level.toUpperCase() }] ${ label } :: ${ msg }`;

    if ( meta instanceof Error ) entry.concat( `: ${ meta.message }` );
    else if ( meta ) entry.concat( `: ${ JSON.stringify( meta ) }` );

    return entry;
  }

  // --- instantiate ---

  public static getInstance () : ILogger {
    return Logger.instance ||= new Logger();
  }
}

// --- singleton instance ---
export const log = Logger.getInstance();
