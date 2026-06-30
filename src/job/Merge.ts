import { Job } from '@/abstract/Job';
import type { IProfile } from '@/interface/profile';
import { Profile } from '@/model/Profile';
import { Parser } from '@/parser/Parser';
import type { TCommandJob, TMergeJobOptions } from '@/type/job';
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

  private isMergeable ( target: IProfile, source: IProfile ) : void {
    const test = ProfileMerger.mergeableProfiles( target.getData(), source.getData() );

    if ( test ) console.log( `Profiles ${ target.getUri() } and ${ source.getUri() } are mergeable.` );
    else console.log( `Profiles ${ target.getUri() } and ${ source.getUri() } are NOT mergeable.` );
  }

  private merge ( target: IProfile, source: IProfile, force: boolean, makeAlias: boolean ) : void {
    this.log( `Merging profile ${ source.getUri() } into ${ target.getUri() }` );

    const res = ProfileMerger.mergeProfiles( target, source, force, makeAlias );
    if ( ! res ) throw new Error( 'Failed to merge profiles.' );
    this.log( 'Merge completed successfully.' );
  }

  public async run () : Promise< void > {
    await this.protect( async () => {
      const { list, source, target, dryRun, force, makeAlias } = this.options;

      if ( list?.length ) this.listMergeable( list );
      else if ( ! source || ! target ) throw new Error( 'Invalid arguments for merge job' );
      else {
        const src = Profile.get( source ), tgt = Profile.get( target );
        if ( ! src || ! tgt ) throw new Error( 'One or both profiles not found' );

        if ( dryRun ) this.isMergeable( tgt, src );
        else this.merge( tgt, src, Parser.boolean( force ), Parser.boolean( makeAlias ) );
      }
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
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
