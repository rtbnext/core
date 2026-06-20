import { Job } from '@/abstract/Job';
import { Fetch } from '@/core/Fetch';
import { ProfileQueue } from '@/core/Queue';
import type { IJob } from '@/interface/job';
import { Parser } from '@/parser/Parser';


export class ProfileJob extends Job implements IJob {
  private static readonly fetch = Fetch.getInstance();
  private static readonly queue = ProfileQueue.getInstance();

  protected override readonly job = 'Profile';

  public async run () : Promise< void > {
    await this.protect( async () => {
      const method = Parser.boolean( this.args.replace ) ? 'setData' : 'updateData';
      const batch = 'profile' in this.args && typeof this.args.profile === 'string'
        ? this.args.profile.split( ',' ).filter( Boolean )
        : ProfileJob.queue.nextUri( Job.config.fetch.rateLimit.batchSize );

      for ( const raw of await ProfileJob.fetch.profile( ...batch ) ) {
        if ( ! raw?.success || ! raw.data ) {
          this.log( 'Request failed', raw, 'warn' );
          continue;
        }
      }
    } );
  }
}
