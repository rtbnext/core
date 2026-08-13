import { ArrayMode } from '@komed3/deepmerge';
import type { TProfileData, TProfileInfo } from '@rtbnext/schema/src/model/profile';
import { CmpStr, type CmpStrResult } from 'cmpstr';

import type { IProfile } from '@/interface/profile';
import { REGEX_URI_CLEANUP } from '@/lib/regex';
import { ProfileIndex } from '@/model/ProfileIndex';
import { Profile } from '@/model/Profile';

export class ProfileMerger {
  private static readonly cmp = CmpStr.create( { metric: 'dice', safeEmpty: true } );
  private static readonly index = ProfileIndex.getInstance();

  // --- helper ---

  private static similarURIs ( uri: string, fuzzy: boolean ) : string[] {
    const clean = ( value: string ) => value.replace( REGEX_URI_CLEANUP, '' );

    const normalized = clean( uri ), reversed = normalized.split( '-' ).reverse().join( '-' );
    const entries = [ ...ProfileMerger.index.values ], owners = new Map< string, string >();

    for ( const { uri: key, aliases } of entries ) for ( const name of [ key, ...aliases ] ) {
      const value = clean( name );
      if ( value ) owners.set( value, key );
    }

    const res = new Set< string >();

    for ( const value of [ normalized, reversed ] ) {
      const owner = owners.get( value );
      if ( owner && owner !== uri ) res.add( owner );
    }

    if ( fuzzy ) {
      for ( const match of ProfileMerger.cmp.match< CmpStrResult[] >( [ ...owners.keys() ], normalized, 0.9 ) ) {
        const owner = owners.get( match.source );
        if ( owner && owner !== uri ) res.add( owner );
      }

      for ( const match of ProfileMerger.cmp.match< CmpStrResult[] >( [ ...owners.keys() ], reversed, 0.8 ) ) {
        const owner = owners.get( match.source );
        if ( owner && owner !== uri ) res.add( owner );
      }
    }
  }

  // --- check mergeable profiles ---

  public static mergeableProfiles ( target: Partial< TProfileData >, source: Partial< TProfileData > ) : boolean {
    if ( ! target && ! source || target.id === source.id ) return true;

    for ( const match of [ 'gender', 'birthDate', 'birthPlace', 'citizenship', 'industry' ] ) if (
      target.info && match in target.info && source.info && match in source.info &&
      JSON.stringify( target.info[ match as keyof TProfileInfo ] ) !==
      JSON.stringify( source.info[ match as keyof TProfileInfo ] )
    ) return false;

    return true;
  }

  // --- find matching profiles ---

  public static findMatching ( profile: IProfile, fuzzy: boolean = false ) : IProfile[] {
    const res: IProfile[] = [];

    for ( const uri of ProfileMerger.similarURIs( profile.getUri(), fuzzy ) ) {
      const match = Profile.get( uri );
      if ( match && ProfileMerger.mergeableProfiles( match.getData(), profile.getData() ) ) res.push( match );
    }

    return res;
  }

  // --- merge profiles ---

  public static mergeProfiles ( target: IProfile, source: IProfile, force: boolean = false, makeAlias: boolean = true ) : boolean {
    return false;
  }

  // --- list matching candidates ---

  public static listCandidates ( ...uriLike: string[] ) : Record< string, string[] > {
    if ( ! uriLike.length ) return {};
    const res: Record< string, string[] > = {};

    for ( const uri of uriLike ) {
      const profile = Profile.get( uri );
      if ( ! profile ) continue;

      const matches = ProfileMerger.findMatching( profile, true );
      res[ profile.getUri() ] = matches.map( m => m.getUri() );
    }

    return res;
  }

}
