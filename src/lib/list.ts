import { RTBListParser } from '@/parser/RTBListParser';
import type { TListRegistry } from '@/type/list';


export const LISTS = {
  rtb: {},
  billionaires: {},
  person: {}
} as const satisfies TListRegistry;
