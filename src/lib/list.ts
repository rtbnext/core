import { RTBListParser } from '@/parser/RTBListParser';
import type { TListConfig, TRTBListItemCtx } from '@/type/list';


export const LISTS = {
  rtb: {
    lists: [ 'rtb' ],
    parser: RTBListParser,
    indexItem: () => ( {
      uri: 'rtb',
      name: 'The World’s Real-Time Billionaires',
      shortName: 'Real-Time Billionaires',
      desc: 'Today’s richest people in the world',
      text: 'todays richest people world',
      columns: [ 'rank', 'diff', 'profile', 'networth', 'today', 'ytd', 'age', 'citizenship', 'source' ],
      filters: [ 'gender', 'industry', 'citizenship', 'diff', 'age' ]
    } ),
    listItem: ( ctx: TRTBListItemCtx ) => ( {} )
  }
} as const satisfies TListConfig;
