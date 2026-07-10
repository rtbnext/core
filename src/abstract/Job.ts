import type { TService } from '@rtbnext/schema/src/base/const';

import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { Status } from '@/core/Status';
import { Utils } from '@/core/Utils';
import type { IJob } from '@/interface/job';
import { Parser } from '@/parser/Parser';
import type { TLoggingLevel } from '@/type/config';
import type { TJobClsOptions } from '@/type/job';


export abstract class Job< T extends TJobClsOptions = TJobClsOptions > implements IJob< T > {
  protected static readonly config = Config.getInstance();
  protected static readonly status = Status.getInstance();

  protected readonly options: T;
  protected readonly job: string;
  protected readonly group: TService;
  protected readonly silent: boolean;
  protected readonly safeMode: boolean;

  constructor ( options: T, job: string, group: TService ) {
    this.options = options;
    this.job = job;
    this.group = group;

    const { silent, safeMode } = Job.config.job;
    this.silent = this.options.silent !== undefined ? Parser.boolean( this.options.silent ) : silent;
    this.safeMode = this.options.safeMode !== undefined ? Parser.boolean( this.options.safeMode ) : safeMode;

    this.log( 'Run job', this.options );
  }

  // --- helper ---

  protected log ( msg: string, meta?: any, as: TLoggingLevel = 'info' ) : void {
    if ( ! this.silent ) log[ as ]( `[JOB::${ this.job.toUpperCase() }] ${ msg }`, meta );
  }

  protected err ( err: unknown, msg?: string ) : void {
    if ( ! this.silent ) log.errMsg( err, msg ? `[JOB::${ this.job.toUpperCase() }] ${ msg }` : undefined );
  }

  protected async protect<
    F extends ( ...args: any[] ) => any, R = Awaited< ReturnType< F > >
  > ( fn: F ) : Promise< R | undefined > {
    try {
      const res = await Utils.measure< F, R >( fn );
      this.log( `Finished in ${ ( res.ms / 1000 ).toFixed( 3 ) } sec` );
      Job.status.log( this.group, this.job, true, res.ms );
      return res.result;
    } catch ( err ) {
      this.err( err );
      Job.status.log( this.group, this.job, false, 0, err );
      if ( ! this.safeMode ) throw err;
    }
  }

  // --- getter ---

  public getJobName () : string {
    return this.job;
  }

  public getJobGroup () : TService {
    return this.group;
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
