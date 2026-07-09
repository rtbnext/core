import { Job } from '@/abstract/Job';
import { ProfileIndex } from '@/model/ProfileIndex';
import { Parser } from '@/parser/Parser';
import type { TCommandJob, TProfileIndexJobOptions } from '@/type/job';


export class ProfileIndexJob extends Job< TProfileIndexJobOptions > {
  private static readonly index = ProfileIndex.getInstance();
  constructor ( options: TProfileIndexJobOptions = {} ) { super( options, 'profile-index' ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {
      const uris = this.options.profiles?.length ? this.options.profiles : undefined;
      const count = ProfileIndexJob.index.rebuildFromProfiles( uris );
      this.log( `Rebuilt profile index from ${ count } profile(s)` );
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'profile-index',
    desc: 'Rebuild the profile index from stored profile data',
    options: [ {
      name: '-p, --profiles <URIs>',
      desc: 'Rebuild only specific profile indexes by URI (comma-separated)',
      parser: ( v: string ) => Parser.list( v, 'string', ',' )
    } ]
  } as const;
}
