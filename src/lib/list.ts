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
      name: ctx.profileData.info!.name.shortName,
      flag: ctx.flag,
      rankDiff: ctx.rankDiff,
      gender: ctx.profileData.info?.gender,
      age: ctx.parsed.age(),
      today: ctx.realtime?.today,
      ytd: ctx.realtime?.ytd,
      citizenship: ctx.profileData.info?.citizenship,
      industry: ctx.profileData.info?.industry!,
      source: ctx.profileData.info?.source!
    } )
  }
} as const satisfies TListConfig;
