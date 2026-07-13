import type { ArrayMode } from '@komed3/deepmerge';
import type {
  TProfileData, TProfileHistory, TProfileHistoryItem,
  TProfileMetaData, TProfileStatus
} from '@rtbnext/schema/src/model/profile';


export interface IProfile {
  getUri () : string;
  getMeta () : TProfileMetaData[ '$metadata' ];
  lastLookup () : number | undefined;
  status () : TProfileStatus | undefined;
  healthy () : boolean | undefined;
  verify ( id: string ) : boolean;
  touch () : void;
  touchLookup () : void;
  needSave () : boolean;
  save ( syncIndex?: boolean ) : void;
  saveStatus ( status: TProfileStatus ) : void;
  getData () : TProfileData;
  setData ( data: TProfileData ) : void;
  updateData ( data: Partial< TProfileData >, mode?: ArrayMode ) : void;
  getHistory () : TProfileHistory;
  setHistory ( history: TProfileHistory ) : void;
  addHistory ( row: TProfileHistoryItem ) : void;
  mergeHistory ( history: TProfileHistory ) : void;
  move ( uriLike: string, makeAlias?: boolean ) : boolean;
}
