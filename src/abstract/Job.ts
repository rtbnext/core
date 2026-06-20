import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import type { IJob } from '@/interface/job';
import type { TLoggingLevel } from '@/type/config';
import type { TArgs } from '@/type/generic';


export abstract class Job implements IJob {
  protected static readonly config = Config.getInstance();

  protected readonly job: string;
  protected readonly args: TArgs = {};
  protected readonly silent: boolean;
  protected readonly safeMode: boolean;

  // --- helper ---

  protected log ( msg: string, meta?: any, as: TLoggingLevel = 'debug' ) : void {
    if ( ! this.silent ) log[ as ]( `[${ this.job }] ${ msg }`, meta );
  }

  protected err ( err: unknown, msg?: string ) : void {
    if ( ! this.silent ) log.errMsg( err, msg ? `[${ this.job }] ${ msg }` : undefined );
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
