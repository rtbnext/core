import { Utils } from '@/core/Utils';
import { Parser } from '@/parser/Parser';
import { PersonListParser } from '@/parser/PersonListParser';
import { RTBListParser } from '@/parser/RTBListParser';
import type { TListConfig, TListIndexItemCtx, TRTBListItemCtx } from '@/type/list';


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
    listItem: ( ctx: TRTBListItemCtx ) => ( {
      uri: ctx.profile ? ctx.profile.getUri() : undefined,
      sourceUri: ctx.parsed.uri(),
      name: ctx.profileData.info!.name.shortName,
      rank: ctx.parsed.rank()!,
      networth: ctx.parsed.networth()!,
      industry: ctx.profileData.info!.industry,
      source: ctx.profileData.info!.source,
      gender: ctx.profileData.info?.gender,
      age: ctx.parsed.age(),
      citizenship: ctx.profileData.info?.citizenship,
      selfMadeRank: ctx.parsed.selfMade()?.rank,
      philanthropyScore: ctx.parsed.philanthropyScore(),
      flag: ctx.flag,
      rankDiff: ctx.rankDiff,
      today: ctx.realtime?.today,
      ytd: ctx.realtime?.ytd
    } )
  },
  person: {
    parser: PersonListParser,
    indexItem: ( uri: string, ctx: TListIndexItemCtx ) => ( {
      uri, name: ctx.name,
      desc: Parser.strict( ctx.desc, 'string' ),
      text: Utils.buildSearchText( ctx.desc || ctx.name ),
      columns: [ 'rank', 'profile', 'networth', 'age', 'citizenship', 'source' ],
      filters: [ 'gender', 'industry', 'citizenship', 'age' ]
    } )
  }
} as const satisfies TListConfig;
