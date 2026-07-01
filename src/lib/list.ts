import { RTBListParser } from '@/parser/RTBListParser';
import type { TListRegistry } from '@/type/list';
import type { TPersonListEntry } from '@/type/response';


export const LISTS = {
  rtb: {
    uri: 'rtb',
    parser: ( raw: TPersonListEntry ) => new RTBListParser( raw ),
    entry: {
      uri: 'rtb',
      name: 'The World’s Real-Time Billionaires',
      shortName: 'Real-Time Billionaires',
      desc: 'Today’s richest people in the world',
      text: 'todays richest people world',
      columns: [ 'rank', 'diff', 'profile', 'networth', 'today', 'ytd', 'age', 'citizenship', 'source' ],
      filters: [ 'gender', 'industry', 'citizenship', 'diff', 'age' ]
    }
  }
} as const satisfies TListRegistry;
