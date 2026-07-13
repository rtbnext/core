import { ArrayMode } from '@komed3/deepmerge';
import type { TProfileData, TProfileHistory, TProfileHistoryItem, TProfileIndexItem, TProfileMetaData } from '@rtbnext/schema/src/model/profile';
import { join } from 'node:path';

import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import type { IProfile } from '@/interface/profile';
import { ProfileIndex } from '@/model/ProfileIndex';


export class Profile implements IProfile {
  private static readonly storage = Storage.getInstance();
  private static readonly index = ProfileIndex.getInstance();

  private touched: boolean = false;
  private uri: string;
  private path: string;
  private meta: TProfileMetaData;
  private data?: TProfileData;
  private history?: TProfileHistory;

  private constructor ( item?: Partial< TProfileIndexItem > ) {
    if ( ! item || ! item.uri ) throw new Error( 'No valid profile index item given' );

    this.uri = item.uri;
    this.path = join( 'profile', item.uri );
    Profile.storage.ensurePath( this.path, true );
    this.meta = this.metaData();
  }

  // --- helper ---

  private resolvePath ( path: string ) : string {
    return join( this.path, path );
  }

  private metaData () : TProfileMetaData {
    return Profile.storage.readJSON< TProfileMetaData >( this.resolvePath( 'meta.json' ) ) || Utils.metaData();
  }

  private resolveHistory ( ...history: TProfileHistory ) : TProfileHistory {
    return [ ...new Map( [ ...this.getHistory(), ...history ].map( i => [ i[ 0 ], i ] ) ).values() ]
      .sort( ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] ) );
  }

  // --- meta data ---

  public getUri () : string {
    return this.uri;
  }

  public getMeta () : TProfileMetaData[ '$metadata' ] {
    return this.meta.$metadata;
  }

  public lastLookup () : number | undefined {
    return this.meta.$metadata.lastLookup ? new Date( this.meta.$metadata.lastLookup ).getTime() : undefined;
  }

  // --- verify profile ---

  public verify ( id: string ) : boolean {
    return Utils.verifyHash( id, this.getData().id );
  }

  // --- check integrity ---

  public check ( data: boolean = false ) : any {
    const missingFiles = [ 'meta.json', 'profile.json', 'history.csv' ].filter(
      file => ! Profile.storage.exists( this.resolvePath( file ) )
    );

    return { missingFiles };
  }

  // --- work flow ---

  public touch () : void {
    this.meta.$metadata.lastModified = Utils.date( 'iso' );
    this.touched = true;
  }

  public touchLookup () : void {
    this.touch();
    this.meta.$metadata.lastLookup = this.meta.$metadata.lastModified;
  }

  public needSave () : boolean {
    return this.touched;
  }

  public save ( syncIndex: boolean = true ) : void {
    if ( ! this.touched ) return;

    log.debug( `Saving profile: ${ this.uri }` );
    log.catch( () => {
      if ( syncIndex && this.data && ! Profile.index.syncFromData( this.data ) )
        throw new Error( 'Failed to update profile index' );

      if ( this.data && ! Profile.storage.writeJSON< TProfileData >(
        this.resolvePath( 'profile.json' ), this.data
      ) ) throw new Error( 'Failed to write profile data' );

      if ( this.history && ! Profile.storage.writeCSV< TProfileHistory >(
        this.resolvePath( 'history.csv' ), this.history
      ) ) throw new Error( 'Failed to write profile history' );

      if ( this.meta && ! Profile.storage.writeJSON< TProfileMetaData >(
        this.resolvePath( 'meta.json' ), this.meta
      ) ) throw new Error( 'Failed to write profile metadata' );

      this.touched = false;
    }, `Failed to save profile: ${ this.uri }` );
  }

  // --- profile data ---

  public getData () : TProfileData {
    return this.data ??= ( Profile.storage.readJSON< TProfileData >(
      this.resolvePath( 'profile.json' )
    ) ?? Profile.factory() ) as TProfileData;
  }

  public setData ( data: TProfileData ) : void {
    this.data = Profile.factory( data ) as TProfileData;
    this.touch();
  }

  public updateData ( data: Partial< TProfileData >, mode: ArrayMode = ArrayMode.Unique ) : void {
    this.data = Utils.merge< TProfileData >( mode, Utils.sortKeysDeep( this.getData() ), Utils.sortKeysDeep( data ) );
    this.touch();
  }

  // --- profile history ---

  public getHistory () : TProfileHistory {
    return this.history ??= ( Profile.storage.readCSV< TProfileHistory >(
      this.resolvePath( 'history.csv' )
    ) ?? [] ) as TProfileHistory;
  }

  public setHistory ( history: TProfileHistory ) : void {
    this.history = history;
    this.touch();
  }

  public addHistory ( row: TProfileHistoryItem ) : void {
    this.setHistory( this.resolveHistory( row ) );
  }

  public mergeHistory ( history: TProfileHistory ) : void {
    this.setHistory( this.resolveHistory( ...history ) );
  }

  // --- move profile ---

  public move ( uriLike: string, makeAlias: boolean = true ) : boolean {
    const uri = Utils.sanitize( uriLike );
    log.debug( `Moving profile: ${ this.uri } -> ${ uri }` );

    return log.catch( () => {
      const item = Profile.index.move( this.uri, uri, makeAlias );
      if ( ! item ) throw new Error( 'Failed to move profile index item' );

      const oldPath = this.path;
      this.uri = uri;
      this.path = join( 'profile', uri );

      if ( ! Profile.storage.move( oldPath, this.path ) ) throw new Error( 'Failed to move profile storage' );

      this.updateData( { uri: uri } );
      this.save( false );

      return true;
    }, `Failed to move profile: ${ this.uri } -> ${ uri }` ) ?? false;
  }

  // --- factory ---

  public static factory ( data?: Partial< TProfileData > ) : Partial< TProfileData > {
    return {
      ...{ info: {}, bio: {}, related: [], media: [], ranking: [], annual: [], assets: [] },
      ...data
    } as Partial< TProfileData >;
  }

  // --- instantiate ---

  public static get ( uriLike: string ) : IProfile | undefined {
    return log.catch(
      () => new Profile( Profile.index.get( uriLike ) ),
      `Failed to get profile: ${ uriLike }`
    );
  }

  public static getByItem ( item: TProfileIndexItem ) : IProfile | undefined {
    return log.catch(
      () => new Profile( item ),
      `Failed to get profile by item: ${ item.uri }`
    );
  }

  public static find ( uriLike: string ) : IProfile | undefined {
    return log.catch(
      () => new Profile( Profile.index.find( uriLike ).values().next().value ),
      `Failed to find profile: ${ uriLike }`
    );
  }

  // --- create profile ---

  public static create ( uriLike: string, data: TProfileData, history?: TProfileHistory, lookup: boolean = false ) : Profile | false {
    const uri = Utils.sanitize( uriLike );
    log.debug( `Creating profile: ${ uri }` );

    return log.catch( () => {
      if ( ! Profile.index.isAliasAvailable( uri ) ) throw new Error( `Profile URI ${ uri } is already taken` );

      const profile = new Profile( { uri } );
      profile.setData( Profile.factory( data ) as TProfileData );
      profile.setHistory( history ?? [] );

      if ( lookup ) profile.touchLookup();
      profile.save();

      log.debug( `Profile created: ${ uri }` );
      return profile;
    }, `Failed to create profile: ${ uri }` ) ?? false;
  }

  // --- delete profile ---

  public static delete ( uriLike: string ) : boolean {
    const uri = Utils.sanitize( uriLike );
    log.debug( `Deleting profile: ${ uri }` );

    return log.catch( () => {
      const path = join( 'profile', uri );
      if ( ! Profile.storage.remove( path ) ) throw new Error( 'Failed to remove profile from storage' );

      Profile.index.delete( uri );

      log.debug( `Profile deleted: ${ uri }` );
      return true;
    }, `Failed to delete profile: ${ uri }` ) ?? false;
  }
}
