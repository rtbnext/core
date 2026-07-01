import { Job } from '@/abstract/Job';
import { ProfileIndex } from '@/model/ProfileIndex';
import { Parser } from '@/parser/Parser';
import type { TAliasJobOptions, TCommandJob } from '@/type/job';


export class AliasJob extends Job< TAliasJobOptions > {
  private static readonly index = ProfileIndex.getInstance();
  constructor ( options: TAliasJobOptions ) { super( options, 'alias' ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {
      for ( const a of this.options.removeGlobal ?? [] ) AliasJob.index.removeAlias( a );

      if ( this.options.profile ) {
        this.options.remove?.length && AliasJob.index.rmvAliases( this.options.profile, ...this.options.remove );
        this.options.add?.length && AliasJob.index.addAliases( this.options.profile, ...this.options.add );
      }
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'alias',
    desc: 'Manage profile aliases',
    options: [ {
      name: '-p, --profile <URI>',
      desc: 'The profile URI whose aliases will be edited'
    }, {
      name: '--add <URIs>',
      desc: 'Aliases to be added to the profile index item (comma-separated)',
      parser: ( v: string ) => Parser.list( v, 'string', ',' )
    }, {
      name: '--remove <URIs>',
      desc: 'Aliases to be removed from the profile index item (comma-separated)',
      parser: ( v: string ) => Parser.list( v, 'string', ',' )
    }, {
      name: '-g, --remove-global <URIs>',
      desc: 'Aliases to remove from any profile index item (comma-separated)',
      parser: ( v: string ) => Parser.list( v, 'string', ',' )
    } ]
  } as const;
}
