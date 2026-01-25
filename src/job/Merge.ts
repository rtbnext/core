import { Job, jobRunner } from '@/abstract/Job';
import { IJob } from '@/interfaces/job';
import { Profile } from '@/model/Profile';
import { Parser } from '@/parser/Parser';
import { ProfileMerger } from '@/utils/ProfileMerger';

export class MergeJob extends Job implements IJob {

    constructor ( args: string[] ) {
        super( args, 'Merge' );
    }

    private listMergeable ( ...uriLike: any[] ) : void {
        for ( const [ uri, list ] of Object.entries( ProfileMerger.listCandidates( uriLike ) ) ) {
            console.log( `Candidates for ${uri}:` );

            if ( ! list.length ) console.log( ' - None' );
            for ( const candidate of list ) console.log( ` - ${candidate}` );
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

    public async run () : Promise< void > {
        await this.protect( async () => {
            const { list, source, target, check, dryRun, test, force, makeAlias } = this.args;

            if ( typeof list === 'string' ) this.listMergeable( ...list.split( ',' ).filter( Boolean ) );
            else if ( typeof source === 'string' && typeof target === 'string' ) {
                const src = Profile.get( source ), tgt = Profile.get( target );
                if ( ! src || ! tgt ) throw new Error( 'One or both profiles not found' );

                if ( check || dryRun || test ) this.isMergeable( src, tgt );
                else this.merge( tgt, src, Parser.boolean( force ), Parser.boolean( makeAlias ) );
            }
            else throw new Error( 'Invalid arguments for merge job' );
        } );
    }

}

jobRunner( MergeJob );
