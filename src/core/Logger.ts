import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { exit } from 'node:process';

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

  private format ( level: TLoggingLevel, msg: string, meta?: unknown ) : string {
    const entry = `[${ Utils.date( 'iso' ) }] [${ level.toUpperCase() }] ${ msg }`;

    if ( meta instanceof Error ) entry.concat( `: ${ meta.message }` );
    else if ( meta ) entry.concat( `: ${ JSON.stringify( meta ) }` );

    return entry;
  }

  private log2Console ( level: TLoggingLevel, entry: string ) : void {
    ( console[ level ] ?? console.log )( entry );
  }

  private log2File ( entry: string ) : void {
    const path = join( this.path, `${ Utils.date( 'ym' ) }.log` );
    appendFileSync( path, entry + '\n', 'utf8' );
  }

  private log ( level: TLoggingLevel, msg: string, meta?: unknown ) : void {
    if ( ! this.shouldLog( level ) ) return;

    const entry = this.format( level, msg, meta );
    if ( this.config.console ) this.log2Console( level, entry );
    if ( this.config.file ) this.log2File( entry );
  }

  // --- logging methods ---

  public error ( msg: string, err?: Error ) : void {
    this.log( 'error', msg, err );
  }

  public errMsg ( err: unknown, msg?: string ) : void {
    this.log( 'error', ( msg ? `${ msg }: ` : '' ) + ( err as Error ).message, err as Error );
  }

  public exit ( msg: string, err?: Error ) : never {
    this.log( 'error', msg, err );
    exit( 1 );
  }

  public warn ( msg: string, meta?: unknown ) : void {
    this.log( 'warn', msg, meta );
  }

  public info ( msg: string, meta?: unknown ) : void {
    this.log( 'info', msg, meta );
  }

  public debug ( msg: string, meta?: unknown ) : void {
    this.log( 'debug', msg, meta );
  }

  // --- catch & log errors ---

  public catch < F extends ( ...args: any[] ) => any, R = ReturnType< F > > (
    fn: F, msg: string, level: TLoggingLevel = 'error'
  ) : R | undefined {
    try { return fn() }
    catch ( err ) { this.log( level, msg, err as Error ) }
  }

  public async catchAsync <
    F extends ( ...args: any[] ) => Promise< any >,
    R = Awaited< ReturnType< F > >
  > (
    fn: F, msg: string, level: TLoggingLevel = 'error'
  ) : Promise< R | undefined > {
    try { return await fn() }
    catch ( err ) { this.log( level, msg, err as Error ) }
  }

  // --- get log file ---

  public getLogFile ( date: string ) : string | undefined {
    return this.catch(
      () => readFileSync( join( this.path, `${ date }.log` ), 'utf8' ),
      `Could not read log file for date ${ date }`
    );
  }

  public getCurrentLogFile () : string | undefined {
    return this.getLogFile( Utils.date( 'ym' ) );
  }

  // --- instantiate ---

  public static getInstance () : ILogger {
    return Logger.instance ??= new Logger();
  }
}

// --- singleton instance ---
export const log = Logger.getInstance();
