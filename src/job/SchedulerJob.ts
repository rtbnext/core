import { Job } from '@/abstract/Job';
import { ListQueue, ProfileQueue } from '@/core/Queue';
import { ListJob } from '@/job/ListJob';
import { ProfileJob } from '@/job/ProfileJob';
import type { TCommandJob, TCronJob, TJobClsOptions } from '@/type/job';


export class SchedulerJob extends Job {
  private static readonly profileQueue = ProfileQueue.getInstance();
  private static readonly listQueue = ListQueue.getInstance();

  constructor ( options: TJobClsOptions = {} ) { super( options, 'scheduler', [ 'system' ] ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {
      if ( ! SchedulerJob.listQueue.size && ! SchedulerJob.profileQueue.size ) {
        this.log( 'Both queues are empty, nothing to process', undefined, 'debug' );
        return;
      }

      const profile = SchedulerJob.profileQueue.size / Job.config.queue.profileScale;
      const list = SchedulerJob.listQueue.size / Job.config.queue.listScale;

      this.log(
        `Current workload :: LIST=${ list.toFixed( 2 ) } PROFILE=${ profile.toFixed( 2 ) }`,
        { profile, list }, 'debug'
      );

      if ( list >= profile ) return new ListJob().run();
      else return new ProfileJob().run();
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'scheduler',
    desc: 'Processes profile/list queue, depending on workload'
  } as const;

  // --- cron job definition ---

  public static readonly cron: TCronJob = [ {
    cronexpr: '*/10 1-22 * * *' // run every 10 minutes between 1:00 AM and 10:59 PM
  } ] as const;
}
