import { ArrayMode } from '@komed3/deepmerge';
import type { TProfileData, TProfileInfo } from '@rtbnext/schema/src/model/profile';
import { CmpStrAsync, type CmpStrResult } from 'cmpstr';

import type { IProfile } from '@/interface/profile';
import { REGEX_URI_CLEANUP } from '@/lib/regex';
import { Profile } from '@/model/Profile';
import { ProfileIndex } from '@/model/ProfileIndex';


CmpStrAsync.filter.add( 'input', 'normalizeUri', ( uri: string ) => uri.replace( REGEX_URI_CLEANUP, '' ) );

export class ProfileMerger {
  private static readonly cmp = CmpStrAsync.create( { metric: 'dice', safeEmpty: true } );
  private static readonly index = ProfileIndex.getInstance();

  // --- helper ---

  private static similarURIs ( uri: string ) : string[] {
    const revUri = uri.split( '-' ).reverse().join( '-' );
    const keys = [ ...ProfileMerger.index.keys ];

    const res = new Set( [
      ...ProfileMerger.cmp.match< CmpStrResult[] >( keys, uri, 0.9 ).map( i => i.source ),
      ...ProfileMerger.cmp.match< CmpStrResult[] >( keys, revUri, 0.8 ).map( i => i.source )
    ] );

    res.delete( uri );
    return [ ...res ];
  }

  // --- check mergeable profiles ---

  public static mergeableProfiles ( target: Partial< TProfileData >, source: Partial< TProfileData > ) : boolean {
    if ( target.id === source.id ) return true;

    for ( const test of [ 'gender', 'birthDate', 'birthPlace', 'citizenship', 'industry' ] ) if (
      target.info && test in target.info && source.info && test in source.info &&
      JSON.stringify( target.info[ test as keyof TProfileInfo ] ) !==
      JSON.stringify( source.info[ test as keyof TProfileInfo ] )
    ) return false;

    return true;
  }

  // --- find matching profiles ---

  public static findMatching ( data: Partial< TProfileData > ) : IProfile[] {
    if ( ! data.id || ! data.uri ) return [];
    const res: IProfile[] = [];

    for ( const uri of ProfileMerger.similarURIs( data.uri ) ) {
      const profile = Profile.get( uri );
      if ( profile && ProfileMerger.mergeableProfiles( profile.getData(), data ) ) res.push( profile );
    }

    return res;
  }

  // --- merge profiles ---

  public static mergeProfiles ( target: IProfile, source: IProfile, force: boolean = false, makeAlias: boolean = true ) : boolean {
    if ( ! force && ! ProfileMerger.mergeableProfiles( target.getData(), source.getData() ) ) return false;

    const aliases = makeAlias ? [ source.getUri() ] : [];
    target.updateData( source.getData(), aliases, false, ArrayMode.Unique );
    target.mergeHistory( source.getHistory() );
    target.save();

    return Profile.delete( source.getUri() );
  }

  // --- list matching candidates ---

  public static listCandidates ( ...uriLike: string[] ) : Record< string, string[] > {
    if ( ! uriLike.length ) return {};
    const res: Record< string, string[] > = {};

    for ( const uri of uriLike ) {
      const profile = Profile.get( uri );
      if ( ! profile ) continue;

      const matches = this.findMatching( profile.getData() );
      res[ profile.getUri() ] = matches.map( m => m.getUri() );
    }

    return res;
  }
}
