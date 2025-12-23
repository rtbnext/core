/**
 * MergeProfile Job
 * 
 * node ./dist/job/MergeProfile.ts [silent?] [safeMode?] [--list=uri1,uri2,...] [--target=uri --source=uri] [--check|--dryRun|--test] [--force] [--makeAlias]
 * @arg silent Whether to suppress log output
 * @arg safeMode Whether to enable safe mode
 * @arg list Comma-separated list of profile URIs to list mergeable candidates for
 * @arg target URI of the target profile to merge into
 * @arg source URI of the source profile to merge from
 * @arg check|dryRun|test Whether to only check if the profiles are mergeable
 * @arg force Whether to force the merge even if profiles are not obviously mergeable
 * @arg makeAlias Whether to make an alias from the source profile URI to the target profile URI
 */

import { Job, jobRunner } from '@/abstract/Job';
import { Profile } from '@/collection/Profile';
import { TArgs } from '@/types/generic';
import { Parser } from '@/utils/Parser';
import { ProfileMerger } from '@/utils/ProfileMerger';

export class MergeProfile extends Job {

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'MergeProfile' );
    }

    private listMergeable ( ...uriLike: any[] ) : void {
        for ( const [ uri, candidates ] of Object.entries( ProfileMerger.listCandidates( uriLike ) ) ) {
            console.log( `Candidates for ${uri}:` );
            if ( ! candidates.length ) console.log( ' - None' );
            for ( const candidate of candidates ) console.log( ` - ${candidate}` );
        }
    }

    private isMergeable ( target: Profile, source: Profile ) : void {
        const test = ProfileMerger.mergeableProfiles( target.getData(), source.getData() );
        if ( test ) console.log( `Profiles ${ target.getUri() } and ${ source.getUri() } are mergeable.` );
        else console.log( `Profiles ${ target.getUri() } and ${ source.getUri() } are NOT mergeable.` );
    }

    private merge ( target: Profile, source: Profile, force: boolean, makeAlias: boolean ) : void {
        this.log( `Merging profile ${ source.getUri() } into ${ target.getUri() }` );
        const res = ProfileMerger.mergeProfiles( target, source, force, makeAlias );
        if ( res ) this.log( `Merge completed successfully.` );
        else this.log( `Merge failed: profiles are not mergeable.`, undefined, 'error' );
    }

    public async run ( args: TArgs ) : Promise< void > {
        await this.protect( async () => {
            if ( typeof args.list === 'string' ) this.listMergeable( ...args.list.split( ',' ).filter( Boolean ) );
            else if ( typeof args.target === 'string' && typeof args.source === 'string' ) {
                const target = Profile.get( args.target ), source = Profile.get( args.source );
                if ( ! target || ! source ) throw new Error( 'One or both profiles not found' );

                if ( args.check || args.dryRun || args.test ) this.isMergeable( target, source );
                else this.merge( target, source, Parser.boolean( args.force ), Parser.boolean( args.makeAlias ) );
            }
        } );
    }

}

jobRunner( MergeProfile );
