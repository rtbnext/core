import { RTBListParser } from '@/parser/RTBListParser';
import type { TListConfig, TRTBListItemCtx } from '@/type/list';


export const LISTS = {
  rtb: {
    parser: RTBListParser,
    lists: [ 'rtb' ],
    indexItem: () => ( {
      uri: 'rtb',
      name: 'The World’s Real-Time Billionaires',
      shortName: 'Real-Time Billionaires',
      desc: 'Today’s richest people in the world',
      text: 'todays richest people world',
      columns: [ 'rank', 'diff', 'profile', 'networth', 'today', 'ytd', 'age', 'citizenship', 'source' ],
      filters: [ 'gender', 'industry', 'citizenship', 'diff', 'age' ]
    } ),
    listItem: ( ctx: TRTBListItemCtx ) => ( {
      uri: ctx.parsed.uri(),
      rank: ctx.parsed.rank()!,
      networth: ctx.parsed.networth()!,
      name: ctx.data.info!.name.shortName,
      flag: ctx.flag,
      rankDiff: ctx.rankDiff,
      gender: ctx.data.info?.gender,
      age: ctx.parsed.age(),
      today: ctx.realtime?.today,
      ytd: ctx.realtime?.ytd,
      citizenship: ctx.data.info?.citizenship,
      industry: ctx.data.info?.industry!,
      source: ctx.data.info?.source!
    } )
  }
} as const satisfies TListConfig;
