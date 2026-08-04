import { Job } from '@/abstract/Job';
import { ListQueue, ProfileQueue } from '@/core/Queue';
import { ListJob } from '@/job/ListJob';
import { ProfileJob } from '@/job/ProfileJob';
import type { TCommandJob, TJobClsOptions } from '@/type/job';


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

      const profile = SchedulerJob.profileQueue.size / Job.config.queue.profilePressure;
      const list = SchedulerJob.listQueue.size / Job.config.queue.listPressure;

      this.log(
        `Current workload :: LIST=${ list.toFixed( 2 ) } PROFILE=${ profile.toFixed( 2 ) }`,
        { profile, list }, 'debug'
      );

      if ( list > profile ) return new ListJob().run();
      else return new ProfileJob().run();
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'scheduler',
    desc: 'Processes either the profile or list queue, depends on workload'
  } as const;
}
