import type { TProfileData, TProfileInfo } from '@rtbnext/schema/src/model/profile';
import { CmpStrAsync, type CmpStrResult } from 'cmpstr';

import { REGEX_URI_CLEANUP } from '@/lib/regex';
import { ProfileIndex } from '@/model/ProfileIndex';


CmpStrAsync.filter.add( 'input', 'normalizeUri', ( uri: string ) => uri.replace( REGEX_URI_CLEANUP, '' ) );

export class ProfileMerger {
  private static readonly cmp = CmpStrAsync.create( { metric: 'dice', safeEmpty: true } );
  private static readonly index = ProfileIndex.getInstance();

  // --- helper ---

  private static similarURIs ( uri: string ) : string[] {
    const revUri = uri.split( '-' ).reverse().join( '-' );
    const keys = [ ...ProfileMerger.index.getIndex().keys() ];

    return [ ...new Set( [
      ...ProfileMerger.cmp.match< CmpStrResult[] >( keys, uri, 0.9 ).map( i => i.source ),
      ...ProfileMerger.cmp.match< CmpStrResult[] >( keys, revUri, 0.8 ).map( i => i.source )
    ] ) ];
  }

  // --- check mergeable profiles ---

  public static mergeableProfiles ( target: TProfileData, source: TProfileData ) : boolean {
    if ( target.id === source.id ) return true;

    for ( const test of [ 'gender', 'birthDate', 'birthPlace', 'citizenship', 'industry' ] ) if (
      test in target.info && test in source.info &&
      JSON.stringify( target.info[ test as keyof TProfileInfo ] ) !==
      JSON.stringify( source.info[ test as keyof TProfileInfo ] )
    ) return false;

    return true;
  }
}
