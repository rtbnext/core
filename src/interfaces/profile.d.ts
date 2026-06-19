import type { ArrayMode } from '@komed3/deepmerge';
import type { TProfileData, TProfileHistory, TProfileHistoryItem, TProfileIndexItem, TProfileMetaData } from '@rtbnext/schema/src/model/profile';


export interface IProfile {
  getUri () : string;
  getItem () : TProfileIndexItem;
  getMeta () : TProfileMetaData[ '$metadata' ];
  schemaVersion () : number;
  lastModified () : string;
  lastModifiedTime () : number;
  lastLookup () : string;
  lastLookupTime () : number;
  verify ( id: string ) : boolean;
  getData () : TProfileData;
  setData (
    data: TProfileData, aliases?: string[], lookup: boolean = false,
    aliasMode: ArrayMode = ArrayMode.Unique
  ) : void;
  updateData (
    data: Partial< TProfileData >, aliases?: string[], lookup: boolean = false,
    mode: ArrayMode = ArrayMode.Replace, aliasMode: ArrayMode = ArrayMode.Unique
  ) : void;
  getHistory () : TProfileHistory;
  setHistory ( history: TProfileHistory ) : void;
  addHistory ( row: TProfileHistoryItem ) : void;
  mergeHistory ( history: TProfileHistory ) : void;
  save () : void;
  move ( uriLike: string, makeAlias: boolean = true ) : boolean;
}
