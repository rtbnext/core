import { Job } from '@/abstract/Job';
import { ProfileIndex } from '@/model/ProfileIndex';
import { Parser } from '@/parser/Parser';
import type { TCommandJob, TRebuildJobOptions } from '@/type/job';


export class RebuildJob extends Job< TRebuildJobOptions > {
  private static readonly index = ProfileIndex.getInstance();
  constructor ( options: TRebuildJobOptions = {} ) { super( options, 'rebuild', [ 'profile' ] ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {
      const count = RebuildJob.index.rebuildFromProfiles( this.options.profiles );
      this.log( `Rebuilt profile index from ${ count } profile(s)` );
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'rebuild',
    desc: 'Rebuild the profile index from stored profile data',
    options: [ {
      name: '-p, --profiles <URIs>',
      desc: 'Rebuild only specific profile indexes by URI (comma-separated)',
      parser: ( v: string ) => Parser.list( v, 'string', ',' )
    } ]
  } as const;
}
