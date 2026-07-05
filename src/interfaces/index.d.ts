import type { TIndex, TMetaData } from '@rtbnext/schema/src/base/generic';
import type { TListIndex, TListIndexItem, TListIndexMap } from '@rtbnext/schema/src/model/list';
import type { TProfileIndex, TProfileIndexItem, TProfileIndexMap } from '@rtbnext/schema/src/model/profile';


export interface IIndex<
  I extends TIndex,
  D extends TMetaData & { count: number, items: I[] },
  M extends Map< string, I >
> {
  readonly size: number;
  readonly values: IterableIterator< I >;
  readonly keys: IterableIterator< string >;
  getIndex () : D;
  has ( uriLike: string ) : boolean;
  get ( uriLike: string ) : I | undefined;
  update ( uriLike: string, data: Partial< I >, allowUpdate?: boolean, save?: boolean ) : I | false;
  delta ( items: Array< { uriLike: string, data: Partial< I > } >, allowUpdate?: boolean ) : number;
  add ( uriLike: string, data: I ) : I | false;
  delete ( uriLike: string ) : void;
  search ( query: string, looseMatch?: boolean ) : D;
}

export interface IProfileIndex extends IIndex< TProfileIndexItem, TProfileIndex, TProfileIndexMap > {
  find ( uriLike: string ) : TProfileIndexMap;
  move ( from: string, to: string, makeAlias?: boolean ) : TProfileIndexItem | false;
  syncFromData ( data: TProfileData ) : TProfileIndexItem | false;
  hasAlias ( aliasLike: string, uriLike?: string ) : string | false;
  isAliasAvailable ( aliasLike: string ) : boolean;
  removeAlias ( aliasLike: string ) : boolean;
  addAliases ( uriLike: string, ...aliases: string[] ) : TProfileIndexItem | false;
  rmvAliases ( uriLike: string, ...aliases: string[] ) : TProfileIndexItem | false;
}

export interface IListIndex extends IIndex< TListIndexItem, TListIndex, TListIndexMap > {}
