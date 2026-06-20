import { Job } from '@/abstract/Job';
import { Fetch } from '@/core/Fetch';
import { ProfileQueue } from '@/core/Queue';
import type { IJob } from '@/interface/job';
import { Profile } from '@/model/Profile';
import { Parser } from '@/parser/Parser';
import { ProfileParser } from '@/parser/ProfileParser';
import { ProfileManager } from '@/util/ProfileManager';
import { Ranking } from '@/util/Ranking';
import { Wiki } from '@/util/Wiki';


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

        // --- parse raw profile data ---
        const parser = new ProfileParser( raw.data );
        const uri = parser.uri();
        const id = parser.id();
        const profileData = Profile.factory( {
          uri, id, info: parser.info(), bio: parser.bio(),
          related: parser.related(), media: parser.media()
        } );

        // --- enrich profile data with ranking and wiki ---
        if ( ! Parser.boolean( this.args.skipRanking ) )
          profileData.ranking = Ranking.generateProfileRanking( parser.sortedLists(), profileData.ranking );

        if ( ! Parser.boolean( this.args.skipWiki ) )
          profileData.wiki = await Wiki.fromProfileData( profileData );

        // --- process profile using ProfileManager ---
        const { action, success } = ProfileManager.process( uri, id, profileData, parser.aliases(), method );
        if ( ! success ) this.log( `Failed to process profile with uri ${ uri }`, profileData, 'warn' );
        else this.log( `Profile with uri ${ uri } processed in ${ action } mode` );
      }
    } );
  }
}
