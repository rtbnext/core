import { Job } from '@/abstract/Job';
import { Parser } from '@/parser/Parser';
import type { TJobDefinition, TMergeJobOptions } from '@/type/job';
import { ProfileMerger } from '@/util/ProfileMerger';


export class MergeJob extends Job< TMergeJobOptions > {
  constructor ( options: TMergeJobOptions ) { super( options, 'merge' ) }

  // --- job runner ---

  private listMergeable ( uriLike: string[] ) : void {
    for ( const [ uri, list ] of Object.entries( ProfileMerger.listCandidates( ...uriLike ) ) ) {
      console.log( `Candidates for ${ uri }:` );

      if ( ! list.length ) console.log( ' - None' );
      for ( const candidate of list ) console.log( ` - ${ candidate }` );
    }
  }

  public async run () : Promise< void > {
    await this.protect( async () => {
      const { list, source, target, dryRun, force, makeAlias } = this.options;

      if ( list?.length ) this.listMergeable( list );
    } );
  }

  // --- command definition ---

  public static readonly definition: TJobDefinition = {
    id: 'merge',
    desc: 'Merge two profiles safely',
    options: [ {
      name: '-l, --list <URIs>',
      desc: 'List merge candidates for the given profile URIs (comma-separated)',
      parser: ( v: string ) => Parser.list( v, 'string', ',' )
    }, {
      name: '-s, --source <URI>',
      desc: 'Source profile URI to merge from'
    }, {
      name: '-t, --target <URI>',
      desc: 'Target profile URI to merge into'
    }, {
      name: '--dry-run',
      desc: 'Perform a dry run of the merge without making any changes'
    }, {
      name: '--force',
      desc: 'Force the merge even if there are potential conflicts'
    }, {
      name: '-a, --make-alias',
      desc: 'Whether to create an alias from the old URI to the new one after merge'
    } ]
  } as const;
}
