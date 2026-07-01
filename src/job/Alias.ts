import { Job } from '@/abstract/Job';
import { Parser } from '@/parser/Parser';
import type { TAliasJobOptions, TCommandJob } from '@/type/job';


export class AliasJob extends Job< TAliasJobOptions > {
  constructor ( options: TAliasJobOptions ) { super( options, 'alias' ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {} );
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
