import type { TProfileData } from '@rtbnext/schema/src/model/profile';

import { Job } from '@/abstract/Job';
import { Image } from '@/core/Image';
import type { IProfile } from '@/interface/profile';
import { Profile } from '@/model/Profile';
import type { TCommandJob, TWikiJobOptions } from '@/type/job';
import { Wiki } from '@/util/Wiki';


export class WikiJob extends Job< TWikiJobOptions > {
  private static readonly image = Image.getInstance();

  constructor ( options: TWikiJobOptions ) { super( options, 'Wiki', [ 'profile' ] ) }

  // --- job runner ---

  private async update ( profile: IProfile ) : Promise< void > {
    this.log( `Update wiki page for profile: ${ profile.getUri() }` );

    const wiki = await Wiki.updateWiki( profile.getData(), this.options.updateImage );
    if ( ! wiki ) throw new Error( `Failed to update wiki data for profile: ${ profile.getUri() }` );

    profile.updateData( { wiki } );
    profile.save();
  }

  private async assign ( profile: IProfile ) : Promise< void > {
    this.log( `Assigning wiki page "${ this.options.assign }" to profile: ${ profile.getUri() }` );

    const wiki = await Wiki.assign( profile.getData(), this.options.assign! );
    if ( ! wiki ) throw new Error( `Wiki page not found: ${ this.options.assign }` );

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

  private async assignImage ( profile: IProfile ) : Promise< void > {
    this.log( `Assigning image "${ this.options.image }" to profile: ${ profile.getUri() }` );

    const image = await Wiki.queryCommonsImage( profile.getUri(), this.options.image! );
    if ( ! image ) throw new Error( `Wikimedia Commons image not found: ${ this.options.image }` );

    profile.updateData( { wiki: { image } } as Partial< TProfileData > );
    profile.save();
  }

  private removeImage ( profile: IProfile ) : void {
    this.log( `Removing Wikimedia Commons image from profile: ${ profile.getUri() }` );

    WikiJob.image.remove( profile.getUri() );

    const data = profile.getData();
    delete data.wiki?.image;

    profile.setData( data );
    profile.save();
  }

  public override async run () : Promise< void > {
    await this.protect( async () => {
      const profile = Profile.find( this.options.profile );
      if ( ! profile ) throw new Error( `Profile not found: ${ this.options.profile }` );

      if ( this.options.assign ) await this.assign( profile );
      else if ( this.options.remove ) this.remove( profile );
      else await this.update( profile );

      if ( this.options.image ) await this.assignImage( profile );
      else if ( this.options.removeImage ) this.removeImage( profile );
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
    }, {
      name: '--remove-image',
      desc: 'Remove the Wikimedia Commons image from the profile'
    } ]
  } as const;
}
