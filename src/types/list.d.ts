import type { TRealtime } from '@rtbnext/schema/src/base/assets';
import type { TChangeFlag } from '@rtbnext/schema/src/base/const';
import type { TListIndexItem, TRTBListItem } from '@rtbnext/schema/src/model/list';
import type { TProfileData } from '@rtbnext/schema/src/model/profile';

import type { IListParser, IRTBListParser } from '@/interface/parser';
import { RTBListParser } from '@/parser/RTBListParser';


export type TListTypes = 'rtb' | 'billionaires' | 'person';

export type TListParserClass< T extends IListParser > = new ( ...args: any[] ) => T;

export type TRTBListItemCtx = {
  parsed: RTBListParser;
  data: Partial< TProfileData >;
  flag: TChangeFlag;
  rankDiff?: number;
  realtime?: TRealtime;
};

export type TRTBListConfig = {
  parser: TListParserClass< IRTBListParser >;
  lists: readonly [ 'rtb' ];
  indexItem ( entry?: Partial< TListIndexItem > ) : TListIndexItem;
  listItem ( ctx: TRTBListItemCtx ) : TRTBListItem;
};

export type TListConfig = {
  rtb: TRTBListConfig;
};
