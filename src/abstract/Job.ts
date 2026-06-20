import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { Utils } from '@/core/Utils';
import type { IJob } from '@/interface/job';
import { Parser } from '@/parser/Parser';
import type { TLoggingLevel } from '@/type/config';
import type { TArgs } from '@/type/generic';


export abstract class Job implements IJob {
  protected static readonly config = Config.getInstance();

  protected abstract readonly job: string;
  protected readonly args: TArgs = {};
  protected readonly silent: boolean;
  protected readonly safeMode: boolean;

  constructor ( args: string[] ) {
    this.args = Utils.parseArgs( args );

    const { silent, safeMode } = Job.config.job;
    this.silent = this.args.silent !== undefined ? Parser.boolean( this.args.silent ) : silent;
    this.safeMode = this.args.safeMode !== undefined ? Parser.boolean( this.args.safeMode ) : safeMode;

    this.log( 'Run job', this.args, 'info' );
  }

  // --- helper ---

  protected log ( msg: string, meta?: any, as: TLoggingLevel = 'debug' ) : void {
    if ( ! this.silent ) log[ as ]( `[${ this.job }] ${ msg }`, meta );
  }

  protected err ( err: unknown, msg?: string ) : void {
    if ( ! this.silent ) log.errMsg( err, msg ? `[${ this.job }] ${ msg }` : undefined );
  }

  protected async protect<
    F extends ( ...args: any[] ) => any,
    R = Awaited< ReturnType< F > >
  > ( fn: F ) : Promise< R | undefined > {
    try { return await fn() }
    catch ( err ) {
      this.err( err );
      if ( ! this.safeMode ) throw err;
    }
  }

  // --- getter ---

  public getJobName () : string {
    return this.job;
  }

  public getArgs () : TArgs {
    return this.args;
  }

  public isSilent () : boolean {
    return this.silent;
  }

  public isSafeMode () : boolean {
    return this.safeMode;
  }

  // --- (abstract) job runner ---

  public abstract run () : void | Promise< void >;
}
