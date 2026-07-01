import type { TListRegistry } from '@/type/list';


export const LISTS = {
  rtb: {
    uri: 'rtb',
    entry: ( date: string, count: number ) =>( {
      uri: 'rtb',
      name: 'The World’s Real-Time Billionaires',
      shortName: 'Real-Time Billionaires',
      date, count,
      desc: 'Today’s richest people in the world',
      text: 'todays richest people world',
      columns: [ 'rank', 'diff', 'profile', 'networth', 'today', 'ytd', 'age', 'citizenship', 'source' ],
      filters: [ 'gender', 'industry', 'citizenship', 'diff', 'age' ]
    } )
  }
} as const satisfies TListRegistry;
