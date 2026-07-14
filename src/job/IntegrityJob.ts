import { Job } from '@/abstract/Job';
import type { TCommandJob, TCronJob, TJobClsOptions } from '@/type/job';
import { Integrity } from '@/util/Integrity';


export class IntegrityJob extends Job {
  constructor ( options: TJobClsOptions = {} ) { super( options, 'integrity', [ 'profile' ] ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => Integrity.run() );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'integrity',
    desc: 'Check profile integrity'
  } as const;

  // --- cron job definition ---

  public static readonly cron: TCronJob = [ {
    cronexpr: '0 0 * * SUN', // run every Sunday at 00:00
  } ] as const;
}
