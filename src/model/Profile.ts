import type { TProfileData, TProfileHistory, TProfileIndexItem, TProfileMetaData } from '@rtbnext/schema/src/model/profile';
import { join } from 'node:path';

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
}
