import { ArrayMode } from '@komed3/deepmerge';
import type { TProfileData, TProfileHistory, TProfileIndexItem, TProfileMetaData } from '@rtbnext/schema/src/model/profile';
import { join } from 'node:path';

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
  private item: TProfileIndexItem;
  private meta: TProfileMetaData;
  private data?: TProfileData;
  private history?: TProfileHistory;

  private constructor ( item?: TProfileIndexItem ) {
    if ( ! item ) throw new Error( 'Profile index item not given' );

    this.uri = item.uri;
    this.item = item;

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

  public lastLookup () : string | undefined {
    return this.meta.$metadata.lastLookup;
  }

  public lastLookupTime () : number | undefined {
    return this.meta.$metadata.lastLookup ? new Date( this.meta.$metadata.lastLookup ).getTime() : undefined;
  }

  // --- verify profile ---

  public verify ( id: string ) : boolean {
    return Utils.verifyHash( id, this.getData().id );
  }

  // --- work flow ---

  public touch () : void {
    this.meta.$metadata.lastModified = Utils.date( 'iso' );
    this.touched = true;
  }

  // --- profile data ---

  public getData () : TProfileData {
    return this.data ??= ( Profile.storage.readJSON< TProfileData >(
      this.resolvePath( 'profile.json' )
    ) ?? {} ) as TProfileData;
  }

  public setData ( data: TProfileData ) : void {
    this.data = Profile.factory( data ) as TProfileData;
    this.touch();
  }

  public updateData ( data: Partial< TProfileData >, mode: ArrayMode = ArrayMode.Replace ) : void {
    this.data = Utils.merge< TProfileData >( mode, this.getData(), data );
    this.touch();
  }

  // --- factory ---

  public static factory ( data?: Partial< TProfileData > ) : Partial< TProfileData > {
    return { ...{
      aliases: [], info: {}, bio: {}, related: [], media: [], ranking: [], annual: [], assets: []
    }, ...data } as Partial< TProfileData >;
  }
}
