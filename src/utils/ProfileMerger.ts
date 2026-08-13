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

  private static similarURIs ( uri: string, fuzzy: boolean = false ) : string[] {
    const clean = ( value: string ) => value.replace( REGEX_URI_CLEANUP, '' );
    const normalized = clean( uri ), reversed = normalized.split( '-' ).reverse().join( '-' );
    const entries = [ ...ProfileMerger.index.values ], owners = new Map< string, Set< string > >();

    for ( const { uri: key, aliases } of entries ) for ( const name of [ key, ...aliases ] )
      if ( clean( name ) ) owners.set( clean( name ), ( owners.get( clean( name ) ) ?? new Set() ).add( key ) );

    const res = new Set< string >();

    for ( const value of [ normalized, reversed ] ) for ( const owner of owners.get( value ) ?? [] )
      if ( owner !== uri ) res.add( owner );

    if ( fuzzy ) {
      const names = [ ...owners.keys() ];

      for ( const match of [
        ...ProfileMerger.cmp.match< CmpStrResult[] >( names, normalized, 0.85 ),
        ...ProfileMerger.cmp.match< CmpStrResult[] >( names, reversed, 0.75 )
      ] ) for ( const owner of owners.get( match.source ) ?? [] )
        if ( owner !== uri ) res.add( owner );
    }

    return [ ...res ];
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

  public static findMatching ( uri: string, data: Partial< TProfileData >, fuzzy: boolean = false ) : IProfile[] {
    const res: IProfile[] = [];

    for ( const matchUri of ProfileMerger.similarURIs( uri, fuzzy ) ) {
      const match = Profile.get( matchUri );
      if ( match && ProfileMerger.mergeableProfiles( match.getData(), data ) ) res.push( match );
    }

    return res;
  }

  // --- merge profiles ---

  public static mergeProfiles ( target: IProfile, source: IProfile, force: boolean = false, makeAlias: boolean = true ) : boolean {
    if ( ! force && ! ProfileMerger.mergeableProfiles( target.getData(), source.getData() ) ) return false;

    target.updateData( source.getData(), ArrayMode.Unique );
    target.mergeHistory( source.getHistory() );
    target.save();

    return Profile.delete( source.getUri() ) && ( ! makeAlias ? true :
      !! ProfileMerger.index.addAliases( target.getUri(), source.getUri() )
    );
  }

  // --- list matching candidates ---

  public static listCandidates ( ...uriLike: string[] ) : Record< string, string[] > {
    if ( ! uriLike.length ) return {};
    const res: Record< string, string[] > = {};

    for ( const uri of uriLike ) {
      const profile = Profile.get( uri );
      if ( ! profile ) continue;

      const matches = ProfileMerger.findMatching( profile.getUri(), profile.getData(), true );
      res[ profile.getUri() ] = matches.map( m => m.getUri() );
    }

    return res;
  }

}
