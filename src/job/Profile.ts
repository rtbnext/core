import { Job } from '@/abstract/Job';
import { Fetch } from '@/core/Fetch';
import { ProfileQueue } from '@/core/Queue';
import { Profile } from '@/model/Profile';
import { ProfileIndex } from '@/model/ProfileIndex';
import { Parser } from '@/parser/Parser';
import { ProfileParser } from '@/parser/ProfileParser';
import type { TCommandJob, TCronJob, TProfileJobOptions } from '@/type/job';
import { ProfileManager } from '@/util/ProfileManager';
import { Ranking } from '@/util/Ranking';
import { Wiki } from '@/util/Wiki';


export class ProfileJob extends Job< TProfileJobOptions > {
  private static readonly fetch = Fetch.getInstance();
  private static readonly queue = ProfileQueue.getInstance();
  private static readonly index = ProfileIndex.getInstance();

  constructor ( options: TProfileJobOptions = {} ) { super( options, 'profile' ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {
      const method = this.options.replace ? 'setData' : 'updateData';
      const batch = this.options.profiles?.length ? this.options.profiles
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
        if ( ! Parser.boolean( this.options.skipRanking ) )
          profileData.ranking = Ranking.generateProfileRanking( parser.sortedLists(), profileData.ranking );

        if ( ! Parser.boolean( this.options.skipWiki ) )
          profileData.wiki = await Wiki.fromProfileData( profileData );

        // --- process profile using ProfileManager ---
        const { action, success } = ProfileManager.process( uri, id, profileData, method, true, true );
        if ( ! success ) this.log( `Failed to process profile with uri ${ uri }`, profileData, 'warn' );

        // --- add profile aliases ---
        ProfileJob.index.addAliases( uri, ...parser.aliases() );

        this.log( `Profile with uri ${ uri } processed in ${ action } mode` );
      }
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'profile',
    desc: 'Fetch and update Forbes profiles',
    options: [ {
      name: '-p, --profiles <URIs>',
      desc: 'Process specific profiles by URI (comma-separated)',
      parser: ( v: string ) => Parser.list( v, 'string', ',' )
    }, {
      name: '--replace',
      desc: 'Replace existing profile data'
    }, {
      name: '--skip-ranking',
      desc: 'Skip ranking generation'
    }, {
      name: '--skip-wiki',
      desc: 'Skip wiki data enrichment'
    } ]
  } as const;

  // --- cron job definition ---

  public static readonly cron: TCronJob< TProfileJobOptions > = [ {
    cronexpr: '*/5 2-23 * * *', // run every 5 minutes between 2:00 and 23:59
  } ] as const;
}
