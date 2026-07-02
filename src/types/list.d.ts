import type { TRealtime } from '@rtbnext/schema/src/base/assets';
import type { TChangeFlag } from '@rtbnext/schema/src/base/const';
import type { TBillionairesListItem, TListIndexItem, TPersonListItem, TRTBListItem } from '@rtbnext/schema/src/model/list';
import type { TProfileData } from '@rtbnext/schema/src/model/profile';

import type { IBillionairesListParser, IListParser, IPersonListParser, IRTBListParser } from '@/interface/parser';


export type TListTypes = 'rtb' | 'billionaires' | 'person';

export type TListParserCls< T extends IListParser > = new ( ...args: any[] ) => T;

export type TListIndexItemCtx = {
  name: string;
  desc: string;
};

export type TRTBListItemCtx = {
  parsed: IRTBListParser;
  profileData: Partial< TProfileData >;
  flag: TChangeFlag;
  rankDiff?: number;
  realtime?: TRealtime;
};

export type TRTBListConfig = {
  lists: readonly [ 'rtb' ];
  parser: TListParserCls< IRTBListParser >;
  indexItem () : TListIndexItem;
  listItem ( ctx: TRTBListItemCtx ) : TRTBListItem;
};

export type TBillionairesListItemCtx = {
  parsed: IRTBListParser;
  profileData: Partial< TProfileData >;
};

export type TBillionairesListConfig = {
  lists: readonly [ 'billionaires', 'forbes-400' ];
  parser: TListParserCls< IBillionairesListParser >;
  indexItem ( uri: string, ctx: TListIndexItemCtx ) : TListIndexItem;
  listItem ( ctx: TBillionairesListItemCtx ) : TBillionairesListItem;
};

export type TPersonListItemCtx = {};

export type TPersonListConfig = {
  lists: readonly [];
  parser: TListParserCls< IPersonListParser >;
  indexItem ( uri: string, ctx: TListIndexItemCtx ) : TListIndexItem;
  listItem ( ctx: TPersonListItemCtx ) : TPersonListItem;
};

export type TListConfig = {
  rtb: TRTBListConfig;
  billionaires: TBillionairesListConfig;
  person: TPersonListConfig;
};
