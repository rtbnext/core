import type { TRealtime } from '@rtbnext/schema/src/base/assets';
import type { TChangeFlag } from '@rtbnext/schema/src/base/const';
import type { TBillionairesListItem, TListIndexItem, TPersonListItem, TRTBListItem } from '@rtbnext/schema/src/model/list';
import type { TProfileData } from '@rtbnext/schema/src/model/profile';
import type { Expand } from 'devtypes/types/util';

import type { IBillionairesListParser, IListParser, IPersonListParser, IRTBListParser } from '@/interface/parser';
import type { TListResponse } from '@/type/response';
import type { IProfile } from '@/interface/profile';


export type TListTypes = 'rtb' | 'billionaires' | 'person';

export type TListParserCls< T extends IListParser > = new ( ...args: any[] ) => T;

export type TListIndexItemCtx = {
  name: string;
  desc: string;
};

export type TPersonListItemCtx = {
  parsed: IPersonListParser;
  profileData: Partial< TProfileData >;
  profile?: IProfile | false;
};

export type TRTBListItemCtx = Expand< TPersonListItemCtx & {
  parsed: IRTBListParser;
  flag: TChangeFlag;
  rankDiff?: number;
  realtime?: TRealtime;
} >;

export type TRTBListConfig = {
  lists: readonly [ 'rtb' ];
  parser: TListParserCls< IRTBListParser >;
  indexItem () : TListIndexItem;
  listItem ( ctx: TRTBListItemCtx ) : TRTBListItem;
};

export type TBillionairesListConfig = {
  lists: readonly [ 'billionaires', 'forbes-400' ];
  parser: TListParserCls< IBillionairesListParser >;
  indexItem ( uri: string, ctx: TListIndexItemCtx ) : TListIndexItem;
  listItem ( ctx: TPersonListItemCtx ) : TBillionairesListItem;
};

export type TPersonListConfig = {
  parser: TListParserCls< IPersonListParser >;
  indexItem ( uri: string, ctx: TListIndexItemCtx ) : TListIndexItem;
  listItem ( ctx: TPersonListItemCtx ) : TPersonListItem;
};

export type TListConfig = {
  rtb: TRTBListConfig;
  billionaires: TBillionairesListConfig;
  person: TPersonListConfig;
};

export type TPreparedList< T extends object > = {
  rawData: TListResponse< T >;
  rawList: T[];
  entries: T[];
};
