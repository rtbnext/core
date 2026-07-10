import { Job } from '@/abstract/Job';
import { Profile } from '@/model/Profile';
import { ProfileIndex } from '@/model/ProfileIndex';
import type { TCommandJob, TJobClsOptions } from '@/type/job';
import { Performance } from '@/util/Performance';


export class PerformanceJob extends Job {
  private static readonly index = ProfileIndex.getInstance();

  constructor ( options: TJobClsOptions = {} ) { super( options, 'performance', [ 'profiles' ] ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {
      for ( const item of PerformanceJob.index.values ) {
        const profile = Profile.getByItem( item );
        if ( ! profile ) {
          this.log( `Profile not found for ${ item.uri }`, undefined, 'warn' );
          continue;
        }

        const performance = Performance.generateProfilePerformance( profile.getHistory() );
        profile.updateData( { performance } );
        profile.save();
      }
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'performance',
    desc: 'Generate profile performance data'
  } as const;
}
