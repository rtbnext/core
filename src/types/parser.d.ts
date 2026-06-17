import type { Parser } from '@/parser/Parser';

export type TParserMethod = keyof typeof Parser;

export type TParserContainer = {
  value: unknown;
  type: TParserMethod;
  strict?: boolean;
  args?: unknown[];
};
