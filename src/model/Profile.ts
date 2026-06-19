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

  private uri: string;
  private path: string;
  private item: TProfileIndexItem;
  private meta: TProfileMetaData;
  private data?: TProfileData;
  private history?: TProfileHistory;

  private constructor ( item?: TProfileIndexItem ) {
    if ( ! item ) throw new Error( `Profile index item not given` );

    this.uri = item.uri;
    this.path = join( 'profile', item.uri );
    this.item = item;

    Profile.storage.ensurePath( this.path, true );
    this.meta = this.metaData();
  }

  // --- helper ---

  private resolvePath ( path: string ) : string {
    return join( this.path, path );
  }

  private metaData () : TProfileMetaData {
    return Profile.storage.readJSON< TProfileMetaData >(
      this.resolvePath( 'meta.json' ) ) ||
      Utils.metaData( { lastLookup: Utils.date( 'iso' ) }
    );
  }

  private touch ( lookup: boolean = false ) : void {
    this.meta.$metadata.lastModified = Utils.date( 'iso' );
    if ( lookup ) this.meta.$metadata.lastLookup = this.meta.$metadata.lastModified;
  }

  private updateIndex ( aliases: string[] = [], mode: ArrayMode = ArrayMode.Unique ) : void {
    const {
      uri, info: { name: { shortName: name } }, bio: { cv },
      wiki: { desc, image: { file, thumb } = {} } = {}
    } = this.getData();

    this.item = {
      uri, name, desc, image: thumb ?? file,
      aliases: Utils.mergeArray( this.item.aliases, aliases, mode ),
      text: Utils.buildSearchText( cv )
    };
  }

  // --- public getter ---

  public getUri () : string {
    return this.uri;
  }

  public getItem () : TProfileIndexItem {
    return this.item;
  }

  public getMeta () : TProfileMetaData[ '$metadata' ] {
    return this.meta.$metadata;
  }

  public schemaVersion () : number {
    return this.meta.$metadata.schemaVersion;
  }

  public lastModified () : string {
    return this.meta.$metadata.lastModified;
  }

  public lastModifiedTime () : number {
    return new Date( this.meta.$metadata.lastModified ).getTime();
  }

  public lastLookup () : string {
    return this.meta.$metadata.lastLookup;
  }

  public lastLookupTime () : number {
    return new Date( this.meta.$metadata.lastLookup ).getTime();
  }

  // --- verify profile ---

  public verify ( id: string ) : boolean {
    return Utils.verifyHash( id, this.getData().id );
  }

  // --- profile data ---

  public getData () : TProfileData {
    return this.data ??= ( Profile.storage.readJSON< TProfileData >(
      this.resolvePath( 'profile.json' )
    ) ?? {} ) as TProfileData;
  }

  public setData (
    data: TProfileData, aliases?: string[], lookup: boolean = false,
    aliasMode: ArrayMode = ArrayMode.Unique
  ) : void {
    this.data = data;
    this.updateIndex( aliases, aliasMode );
    this.touch( lookup );
  }

  public updateData (
    data: Partial< TProfileData >, aliases?: string[], lookup: boolean = false,
    mode: ArrayMode = ArrayMode.Replace, aliasMode: ArrayMode = ArrayMode.Unique
  ) : void {
    this.data = Utils.merge< TProfileData >( mode, this.getData(), data );
    this.updateIndex( aliases, aliasMode );
    this.touch( lookup );
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
    this.getHistory();
    this.history!.push( row );
    this.touch();
  }

  public mergeHistory ( history: TProfileHistory ) : void {
    this.history = Array.from(
      new Map( [ ...this.getHistory(), ...history ].map( i => [ i[ 0 ], i ] ) ).values()
    ).sort( ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] ) );
    this.touch();
  }

  // --- save profile data ---

  public save () : void {
    log.debug( `Saving profile: ${ this.uri }` );
    log.catch( () => {
      if ( ! Profile.index.update( this.uri, this.item ) ) throw new Error( `Failed to update profile index` );

      if ( this.data && ! Profile.storage.writeJSON< TProfileData >(
        this.resolvePath( 'profile.json' ), this.data
      ) ) throw new Error( `Failed to write profile data` );

      if ( this.history && ! Profile.storage.writeCSV< TProfileHistory >(
        this.resolvePath( 'history.csv' ), this.history
      ) ) throw new Error( `Failed to write profile history` );

      if ( this.meta && ! Profile.storage.writeJSON< TProfileMetaData >(
        this.resolvePath( 'meta.json' ), this.meta
      ) ) throw new Error( `Failed to write profile metadata` );
    }, `Failed to save profile: ${ this.uri }` );
  }

  // --- move profile ---

  public move ( uriLike: string, makeAlias: boolean = true ) : boolean {
    const uri = Utils.sanitize( uriLike );
    log.debug( `Moving profile: ${ this.uri } -> ${ uri }` );

    return log.catch( () => {
      const item = Profile.index.move( this.uri, uri, makeAlias );
      if ( ! item ) throw new Error( `Failed to move profile index item` );

      const oldPath = this.path;
      this.uri = uri;
      this.path = join( 'profile', uri );
      this.item = item;

      if ( ! Profile.storage.move( oldPath, this.path ) ) throw new Error( `Failed to move profile storage` );

      this.updateData( { uri: uri } );
      this.save();
      return true;
    }, `Failed to move profile: ${ this.uri } -> ${ uri }` ) ?? false;
  }
}
