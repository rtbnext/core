import { ArrayMode } from '@komed3/deepmerge';
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
    const entries = [ ...ProfileMerger.index.values ];
    const names: string[] = [], owners = new Map< string, string >();

    for ( const { uri: key, aliases } of entries ) for ( const name of [ key, ...aliases ] )
      names.push( name ), owners.set( name, key );

    const res = new Set( [
      ...ProfileMerger.cmp.match< CmpStrResult[] >( names, uri, 0.9 ).map( i => owners.get( i.source ) ),
      ...ProfileMerger.cmp.match< CmpStrResult[] >( names, revUri, 0.8 ).map( i => owners.get( i.source ) )
    ] );

    res.delete( uri );
    return [ ...res ].filter( Boolean ) as string[];
  }

  // --- check mergeable profiles ---

  public static mergeableProfiles ( target: Partial< TProfileData >, source: Partial< TProfileData > ) : boolean {
    if ( ! target || ! source || target.id === source.id ) return true;

    for ( const match of [ 'gender', 'birthDate', 'birthPlace', 'citizenship', 'industry' ] ) if (
      target.info && match in target.info && source.info && match in source.info &&
      JSON.stringify( target.info[ match as keyof TProfileInfo ] ) !==
      JSON.stringify( source.info[ match as keyof TProfileInfo ] )
    ) return false;

    return true;
  }
}
