import type { ArrayMode } from '@komed3/deepmerge';
import type { TProfileData, TProfileHistory, TProfileHistoryItem, TProfileMetaData } from '@rtbnext/schema/src/model/profile';


export interface IProfile {
  getUri () : string;
  getMeta () : TProfileMetaData[ '$metadata' ];
  schemaVersion () : number;
  lastModified () : string;
  lastModifiedTime () : number;
  lastLookup () : string | undefined;
  lastLookupTime () : number | undefined;
  verify ( id: string ) : boolean;
  touch () : void;
  touchLookup () : void;
  needSave () : boolean;
  save ( syncIndex: boolean = true ) : void;
  getData () : TProfileData;
  setData ( data: TProfileData ) : void;
  updateData ( data: Partial< TProfileData >, mode: ArrayMode = ArrayMode.Replace ) : void;
  getHistory () : TProfileHistory;
  setHistory ( history: TProfileHistory ) : void;
  addHistory ( row: TProfileHistoryItem ) : void;
  mergeHistory ( history: TProfileHistory ) : void;
  save () : void;
  move ( uriLike: string, makeAlias: boolean = true ) : boolean;
}
