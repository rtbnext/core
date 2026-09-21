import { Job } from '@/abstract/Job';
import type { IProfile } from '@/interface/profile';
import { Profile } from '@/model/Profile';
import type { TCommandJob, TWikiJobOptions } from '@/type/job';
import { Wiki } from '@/util/Wiki';


export class WikiJob extends Job< TWikiJobOptions > {
  constructor ( options: TWikiJobOptions ) { super( options, 'Wiki', [ 'profile' ] ) }

  // --- job runner ---

  private async update ( profile: IProfile, updateImage: boolean ) : Promise< void > {
    this.log( `Update wiki page for profile: ${ profile.getUri() }` );

    const wiki = await Wiki.updateWiki( profile.getData(), updateImage );
    if ( ! wiki ) throw new Error( `Failed to update wiki data for profile: ${ profile.getUri() }` );

    profile.updateData( { wiki } );
    profile.save();
  }

  private async assign ( profile: IProfile, title: string ) : Promise< void > {
    this.log( `Assigning wiki page "${ title }" to profile: ${ profile.getUri() }` );

    const wiki = await Wiki.assign( profile.getData(), title );
    if ( ! wiki ) throw new Error( `Wiki page not found: ${ title }` );

    profile.updateData( { wiki } );
    profile.save();
  }

  private remove ( profile: IProfile ) : void {
    this.log( `Removing wiki assignment from profile: ${ profile.getUri() }` );

    const data = profile.getData();
    delete data.wiki;

    profile.setData( data );
    profile.save();
  }

  public override async run () : Promise< void > {
    await this.protect( async () => {
      const profile = Profile.find( this.options.profile );
      if ( ! profile ) throw new Error( `Profile not found: ${ this.options.profile }` );

      if ( this.options.assign ) await this.assign( profile, this.options.assign );
      else if ( this.options.remove ) this.remove( profile );
      else await this.update( profile, this.options.updateImage ?? false );
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
    }, {
      name: '--remove',
      desc: 'Remove the wiki assignment from the profile'
    }, {
      name: '--update-image',
      desc: 'Update the image from the current Wikipedia page'
    }, {
      name: '--image <TITLE>',
      desc: 'Link the specified Wikimedia Commons image only'
    } ]
  } as const;
}
