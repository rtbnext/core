import type { Parser } from '@/parser/Parser';

export type TParserDateType = 'iso' | 'ymd' | 'ym' | 'y';

export type TParserMethod = Exclude< keyof typeof Parser, 'prototype' >;

export type TParserContainer = {
  value: unknown;
  type: TParserMethod;
  strict?: boolean;
  args?: unknown[];
};
