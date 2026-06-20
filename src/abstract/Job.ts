import { Config } from '@/core/Config';
import type { IJob } from '@/interface/job';
import type { TArgs } from '@/type/generic';


export abstract class Job implements IJob {
  protected static readonly config = Config.getInstance();

  protected readonly job: string;
  protected readonly args: TArgs = {};
  protected readonly silent: boolean;
  protected readonly safeMode: boolean;

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
}
