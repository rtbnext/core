import { Utils } from '@/core/Utils';
import { BillionairesListParser } from '@/parser/BillionairesListParser';
import { PersonListParser } from '@/parser/PersonListParser';
import { RTBListParser } from '@/parser/RTBListParser';
import type { TListConfig, TListIndexItemCtx, TListTypes, TPersonListItemCtx, TRTBListItemCtx } from '@/type/list';


const personListItem = ( ctx: TPersonListItemCtx ) => ( {
  uri: ctx.profileData.uri ?? ctx.parsed.uri(),
  sourceUri: ctx.parsed.uri(),
  rank: ctx.parsed.rank()!,
  networth: ctx.parsed.networth()!,
  name: ctx.profileData.info!.name.shortName,
  gender: ctx.profileData.info?.gender,
  age: ctx.parsed.age(),
  citizenship: ctx.profileData.info?.citizenship,
  industry: ctx.profileData.info?.industry!,
  source: ctx.profileData.info?.source!
} );

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
      ...personListItem( ctx ),
      flag: ctx.flag,
      rankDiff: ctx.rankDiff,
      today: ctx.realtime?.today,
      ytd: ctx.realtime?.ytd
    } )
  },
  billionaires: {
    lists: [ 'billionaires', 'forbes-400' ],
    parser: BillionairesListParser,
    indexItem: ( uri: string, ctx: TListIndexItemCtx ) => ( {
      uri, name: ctx.name, shortName: ctx.name, desc: ctx.desc,
      text: Utils.buildSearchText( ctx.desc ),
      columns: [ 'rank', 'profile', 'networth', 'age', 'citizenship', 'selfMadeRank', 'philanthropyScore', 'source' ],
      filters: [ 'gender', 'industry', 'citizenship', 'age', 'selfMadeRank', 'philanthropyScore' ]
    } ),
    listItem: ( ctx: TPersonListItemCtx ) => ( {
      ...personListItem( ctx ),
      selfMadeRank: ctx.parsed.selfMade()?.rank,
      philanthropyScore: ctx.parsed.philanthropyScore()
    } )
  },
  person: {
    parser: PersonListParser,
    indexItem: ( uri: string, ctx: TListIndexItemCtx ) => ( {
      uri, name: ctx.name, shortName: ctx.name, desc: ctx.desc,
      text: Utils.buildSearchText( ctx.desc ),
      columns: [ 'rank', 'profile', 'networth', 'age', 'citizenship', 'source' ],
      filters: [ 'gender', 'industry', 'citizenship', 'age' ]
    } ),
    listItem: personListItem
  }
} as const satisfies TListConfig;


export const getListConfigByUri = ( uri: string ) : ( typeof LISTS )[ TListTypes ] => {
  for ( const config of Object.values( LISTS ) )
    if ( 'lists' in config && ( config.lists as ReadonlyArray< string > ).includes( uri ) )
      return config;

  return LISTS.person;
};
