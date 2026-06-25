import { Job } from '@/abstract/Job';
import type { IProfile } from '@/interface/profile';
import { Profile } from '@/model/Profile';
import type { TCommandJob, TCronJob, TWikiJobOptions } from '@/type/job';
import { Wiki } from '@/util/Wiki';


export class WikiJob extends Job< TWikiJobOptions > {
  constructor ( options: TWikiJobOptions ) { super( options, 'Wiki' ) }

  // --- job runner ---

  private async update ( profile: IProfile ) : Promise< void > {
    this.log( `Updating wiki for profile: ${ profile.getUri() }` );

    const wiki = await Wiki.fromProfileData( profile.getData() );
    if ( ! wiki ) throw new Error( `No wiki data found for profile: ${ profile.getUri() }` );

    profile.updateData( { wiki } );
    profile.save();
  }

  private async assign ( profile: IProfile, title: string ) : Promise< void > {
    this.log( `Assigning wiki page "${ title }" to profile: ${ profile.getUri() }` );

    const wiki = await Wiki.queryWikiPage( title );
    if ( ! wiki ) throw new Error( `Wiki page not found: ${ title }` );

    profile.updateData( { wiki } );
    profile.save();
  }

  public override async run () : Promise< void > {
    await this.protect( async () => {
      const profile = Profile.find( this.options.profile );
      if ( ! profile ) throw new Error( `Profile not found: ${ this.options.profile }` );

      if ( this.options.assign ) await this.assign( profile, this.options.assign );
      else await this.update( profile );
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'wiki',
    desc: 'Update and assign wiki data to a profile',
    options: [ {
      name: '-p, --profile <URI>',
      desc: 'The profile URI to process',
      required: true
    }, {
      name: '--assign <TITLE>',
      desc: 'Assign wiki data from the specified wiki title to the profile'
    } ]
  } as const;

  // --- cron job definition ---

  public static readonly cron: TCronJob = [] as const;
}
