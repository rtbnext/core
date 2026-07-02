import type { IListParser } from '@/interface/parser';
import type { TListIndexItem, TListItem } from '@rtbnext/schema/src/model/list';


export type TListTypes = 'rtb' | 'billionaires' | 'person';

export type TListParserClass = new ( ...args: any[] ) => IListParser;

export type TListConfig = {
  parser: TListParserClass;
  indexItem ( entry?: Partial< TListIndexItem > ) : TListIndexItem;
  listItem < T extends TListItem > ( ctx: object ) : T;
  lists?: string[];
};

export type TListRegistry = readonly Record< TListTypes, TListConfig >;
