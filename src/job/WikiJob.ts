import { Job } from '@/abstract/Job';
import { Profile } from '@/model/Profile';
import type { TCommandJob, TWikiJobOptions } from '@/type/job';
import { Wiki } from '@/util/Wiki';


export class WikiJob extends Job< TWikiJobOptions > {
  constructor ( options: TWikiJobOptions ) { super( options, 'Wiki', [ 'profile' ] ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {
      const profile = Profile.find( this.options.profile );
      if ( ! profile ) throw new Error( `Profile not found: ${ this.options.profile }` );

      if ( this.options.assign ) Wiki.assign( profile.getData(), this.options.assign );
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
