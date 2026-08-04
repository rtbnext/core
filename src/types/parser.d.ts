import type { TProfileName } from '@rtbnext/schema/src/model/profile';

import type { Parser } from '@/parser/Parser';


export type TParserDateType = 'iso' | 'ymd' | 'ym' | 'y';

export type TParserMethod = Exclude< keyof typeof Parser, 'prototype' >;

export type TParserContainer = {
  value: unknown;
  type: TParserMethod;
  strict?: boolean;
  args?: unknown[];
};

export type TNameResult = {
  family: boolean;
  name: TProfileName;
};
