import type { TAsset, TRealtime } from '@rtbnext/schema/src/base/assets';
import type { TChangeFlag } from '@rtbnext/schema/src/base/const';
import type { TProfileData } from '@rtbnext/schema/src/model/profile';

import type { IRTBListParser } from '@/interface/parser';
import { Parser } from '@/parser/Parser';
import { PersonListParser } from '@/parser/PersonListParser';


export class RTBListParser extends PersonListParser implements IRTBListParser {
  public assets () : TAsset[] {
    return this.cache( 'assets', () => ( this.raw.financialAssets ?? [] ).map( a =>
      Parser.container< TAsset >( {
        type: { value: 'public', type: 'string' },
        label: { value: a.companyName, type: 'string' },
        value: { value: a.numberOfShares && ( a.currentPrice ?? a.sharePrice )
          ? a.numberOfShares * ( a.currentPrice ?? a.sharePrice )! / 1e6
          : undefined, type: 'money' },
        info: { value: a.exchange && a.ticker ? Parser.container< TAsset[ 'info' ] >( {
          exchange: { value: a.exchange, type: 'string' },
          ticker: { value: a.ticker, type: 'string' },
          shares: { value: a.numberOfShares, type: 'number' },
          price: { value: a.currentPrice ?? a.sharePrice, type: 'number', args: [ 6 ] },
          currency: { value: a.currencyCode, type: 'string' },
          exRate: { value: a.exchangeRate, type: 'number', args: [ 6 ] }
        } ) : undefined, type: 'container' }
      } )
    ) );
  }

  public realtime ( data?: Partial< TProfileData >, prev?: string, next?: string ) : TRealtime | undefined {
    return this.cache( 'realtime', () => {
      if ( ! this.raw.finalWorth ) return;

      const cur = this.raw.finalWorth;
      const lastDay = data?.realtime?.networth;
      const lastYear = data?.annual?.find( i => i.year === this.year() - 1 )?.networth?.last;
      let diff;

      return {
        date: this.date(), rank: this.rank(), networth: this.networth(), prev, next,
        today: lastDay ? {
          value: Parser.money( diff = cur - lastDay ),
          percent: Parser.pct( diff / lastDay * 100 )
        } : undefined,
        ytd: lastYear ? {
          value: Parser.money( diff = cur - lastYear ),
          percent: Parser.pct( diff / lastYear * 100 )
        } : undefined
      };
    } );
  }

  public rankDiff ( data?: Partial< TProfileData > ) : { flag: TChangeFlag, rankDiff?: number } {
    if ( this.rank() === undefined || ( this.networth() ?? 0 ) < 1000 ) return { flag: 'dropoff' };

    const item = data?.annual?.find( i => i.year === this.year() - 1 );
    if ( ! item ) return { flag: data?.annual?.filter( i => i.rank?.last !== undefined ).length ? 'returned' : 'new' };
    if ( item.rank?.last === undefined ) return { flag: 'unknown' };

    const rankDiff = item.rank.last - this.rank()!;
    return { flag: rankDiff > 0 ? 'up' : rankDiff < 0 ? 'down' : 'unchanged', rankDiff };
  }
}
