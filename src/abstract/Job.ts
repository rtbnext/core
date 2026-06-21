import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import type { IJob } from '@/interface/job';
import { Parser } from '@/parser/Parser';
import type { TLoggingLevel } from '@/type/config';
import { TJobClsOptions } from '@/type/job';


export abstract class Job< T extends TJobClsOptions = TJobClsOptions > implements IJob< T > {
  protected static readonly config = Config.getInstance();

  protected readonly options: T;
  protected readonly job: string;
  protected readonly silent: boolean;
  protected readonly safeMode: boolean;

  constructor ( options: T, job: string ) {
    this.options = options;
    this.job = job;

    const { silent, safeMode } = Job.config.job;
    this.silent = this.options.silent !== undefined ? Parser.boolean( this.options.silent ) : silent;
    this.safeMode = this.options.safeMode !== undefined ? Parser.boolean( this.options.safeMode ) : safeMode;

    this.log( 'Run job', this.options, 'info' );
  }

  // --- helper ---

  protected log ( msg: string, meta?: any, as: TLoggingLevel = 'debug' ) : void {
    if ( ! this.silent ) log[ as ]( `[${ this.job.toUpperCase() }] ${ msg }`, meta );
  }

  protected err ( err: unknown, msg?: string ) : void {
    if ( ! this.silent ) log.errMsg( err, msg ? `[${ this.job.toUpperCase() }] ${ msg }` : undefined );
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

  public getOptions () : T {
    return this.options;
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
