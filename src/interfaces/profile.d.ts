import type { ArrayMode } from '@komed3/deepmerge';
import type { TProfileData, TProfileHistory, TProfileHistoryItem, TProfileMetaData } from '@rtbnext/schema/src/model/profile';


export interface IProfile {
  getUri () : string;
  getMeta () : TProfileMetaData[ '$metadata' ];
  readonly schemaVersion: TProfileMetaData[ '$metadata' ][ 'schemaVersion' ];
  readonly generator: TProfileMetaData[ '$metadata' ][ 'generator' ];
  readonly lastModified: string;
  readonly lastModifiedTime: number;
  readonly lastLookup: string | undefined;
  readonly lastLookupTime: number | undefined;
  verify ( id: string ) : boolean;
  touch () : void;
  touchLookup () : void;
  needSave () : boolean;
  save ( syncIndex?: boolean ) : void;
  getData () : TProfileData;
  setData ( data: TProfileData ) : void;
  updateData ( data: Partial< TProfileData >, mode?: ArrayMode ) : void;
  getHistory () : TProfileHistory;
  setHistory ( history: TProfileHistory ) : void;
  addHistory ( row: TProfileHistoryItem ) : void;
  mergeHistory ( history: TProfileHistory ) : void;
  move ( uriLike: string, makeAlias?: boolean ) : boolean;
}
