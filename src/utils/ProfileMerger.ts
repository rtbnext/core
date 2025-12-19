import { Profile } from '@/collection/Profile';
import { ProfileIndex } from '@/collection/ProfileIndex';
import { TProfileData } from '@/types/profile';
import { CmpStr, CmpStrResult } from 'cmpstr';

CmpStr.filter.add( 'input', 'normalizeUri', ( uri: string ) : string =>
    uri.replace( /-(family|\d+)$/i, '' )
);

export class ProfileMerger {

    private static readonly cmp = CmpStr.create( { metric: 'dice' } );
    private static readonly index = ProfileIndex.getInstance();

    private static similarURIs ( uri: string ) : string[] {
        return ProfileMerger.cmp.match< CmpStrResult[] >(
            [ ...ProfileMerger.index.getIndex().keys() ], uri, 0.5
        ).map( i => i.source );
    }

    private static mergeableProfiles ( target: TProfileData, source: TProfileData ) : boolean {
        if ( target.id === source.id ) return true;

        for ( const test of [ 'gender', 'birthDate', 'birthPlace', 'citizenship' ] ) if (
            test in target.info && test in source.info &&
            JSON.stringify( ( target.info as any )[ test ] ) !==
            JSON.stringify( ( source.info as any )[ test ] )
        ) return false;

        return true;
    }

    public static mergeProfiles ( target: Profile, source: Profile, force: boolean = false ) : void {
        if ( ! ( force || this.mergeableProfiles( target.getData(), source.getData() ) ) ) return;
        target.updateData( source.getData(), [], 'unique' );
        target.save();
        Profile.delete( source.getUri() );
    }

    public static findMatch ( data: Partial< TProfileData > ) : Profile | false {
        const { id, uri } = data;
        if ( ! id || ! uri ) return false;
        for ( const test of ProfileMerger.similarURIs( uri ) ) {
            const profile = Profile.get( test );
            if ( profile && this.mergeableProfiles( profile.getData(), data as TProfileData ) ) return profile;
        }
        return false;
    }

}
