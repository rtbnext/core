import type { TIndex } from '@rtbnext/schema/src/base/generic';
import type { TListIndex, TListIndexItem } from '@rtbnext/schema/src/model/list';
import type { TProfileIndex, TProfileIndexItem } from '@rtbnext/schema/src/model/profile';


export interface IIndex< I extends TIndex, T extends Map< string, I > > {
  readonly size: number;
  readonly values: IterableIterator< I >;
  readonly keys: IterableIterator< string >;
  getIndex () : T;
  has ( uriLike: string ) : boolean;
  get ( uriLike: string ) : I | undefined;
  update ( uriLike: string, data: Partial< I >, allowUpdate: boolean = true, save: boolean = true ) : I | false;
  delta ( items: Array< { uriLike: string, data: Partial< I > } >, allowUpdate: boolean = true ) : number;
  add ( uriLike: string, data: I ) : I | false;
  delete ( uriLike: string ) : void;
  search ( query: string, looseMatch: boolean = false ) : T;
}

export interface IProfileIndex extends IIndex< TProfileIndexItem, TProfileIndex > {
  find ( uriLike: string ) : TProfileIndex;
  move ( from: string, to: string, makeAlias: boolean = true ) : TProfileIndexItem | false;
  setFromData ( data: TProfileData ) : TProfileIndexItem | false;
  hasAlias ( aliasLike: string, uriLike?: string ) : string | false;
  isAliasAvailable ( aliasLike: string ) : boolean;
  removeAlias ( aliasLike: string ) : boolean;
  addAliases ( uriLike: string, ...aliases: string[] ) : TProfileIndexItem | false;
  rmvAliases ( uriLike: string, ...aliases: string[] ) : TProfileIndexItem | false;
}

export interface IListIndex extends IIndex< TListIndexItem, TListIndex > {}
