import type { TAsset, TChangeItem, TRealtime } from '@rtbnext/schema/src/base/assets';
import type { TChangeFlag } from '@rtbnext/schema/src/base/const';
import type { TLocation, TOrganization, TSelfMade } from '@rtbnext/schema/src/base/generic';
import type { TProfileBio, TProfileData, TProfileInfo, TProfileName } from '@rtbnext/schema/src/model/profile';
import type { TGenericStats } from '@rtbnext/schema/src/model/stats';

import { Cache } from '@/abstract/Cache';
import { Utils } from '@/core/Utils';
import type { IListParser, IParsonListParser } from '@/interface/parser';
import { Parser } from '@/parser/Parser';
import { ProfileParser } from '@/parser/ProfileParser';
import type { TPersonListEntry } from '@/type/response';


export class ListParser< T extends object > extends Cache implements IListParser< T > {
  constructor ( protected readonly raw: T ) { super() }
  public rawData () : T { return this.raw }
}


export class PersonListParser extends ListParser< TPersonListEntry > implements IParsonListParser {
  public uri () : string {
    return this.cache( 'uri', () => Utils.sanitize( this.raw.uri ) );
  }

  public id () : string {
    return this.cache( 'id', () => Utils.hash( this.raw.naturalId ) );
  }

  // --- basic fields ---

  public date () : string {
    return this.cache( 'date', () => Parser.date( this.raw.date ?? this.raw.timestamp, 'ymd' )! );
  }

  public year () : number {
    return this.cache( 'year', () => Number( this.date().slice( 0, 4 ) ) );
  }

  public rank () : number | undefined {
    return this.cache( 'rank', () =>
      Parser.strict( this.raw.rank, 'number' ) ??
      Parser.strict( this.raw.position, 'number' )
    );
  }

  public networth () : number | undefined {
    return this.cache( 'networth', () => Parser.strict( this.raw.finalWorth, 'money' ) );
  }

  public dropOff () : boolean | undefined {
    return this.cache( 'dropOff', () => this.raw.finalWorth ? this.raw.finalWorth < 1e3 : undefined );
  }

  public name () : { name: TProfileName, family: boolean } {
    return this.cache( 'name', () => ProfileParser.name(
      this.raw.person?.name ?? this.raw.personName, this.raw.lastName
    ) );
  }

  // --- profile data ---

  public info () : TProfileInfo {
    return this.cache( 'info', () => ( {
      flags: { dropOff: this.dropOff() }, ...this.name(),
      ...Parser.container< Partial< TProfileInfo > >( {
        gender: { value: this.raw.gender, type: 'gender' },
        birthDate: { value: this.raw.birthDate, type: 'date' },
        citizenship: { value: this.raw.countryOfCitizenship, type: 'country' },
        industry: { value: this.raw.industries?.[ 0 ], type: 'industry' },
        source: { value: this.raw.source, type: 'list' }
      } ),
      residence: this.residence(),
      selfMade: this.selfMade(),
      philanthropyScore: this.philanthropyScore(),
      organization: this.organization()
    } ) ) as TProfileInfo;
  }

  public residence () : TLocation | undefined {
    return Parser.location( {
      country: this.raw.country,
      state: this.raw.state,
      city: this.raw.city
    } );
  }

  public selfMade () : TSelfMade | undefined {
    return this.cache( 'selfMade', () => {
      if ( this.raw.selfMadeRank ) return Parser.container< TSelfMade >( {
        is: { value: this.raw.selfMadeRank > 7, type: 'boolean' },
        rank: { value: this.raw.selfMadeRank, type: 'number' }
      } );
    } );
  }

  public philanthropyScore () : number | undefined {
    return this.cache( 'philanthropyScore', () => Parser.strict< number >( this.raw.philanthropyScore, 'number' ) );
  }

  public organization () : TOrganization | undefined {
    return this.cache( 'organization', () => {
      if ( this.raw.organization ) return Parser.container< TOrganization >( {
        name: { value: this.raw.organization, type: 'string' },
        title: { value: this.raw.title, type: 'string' }
      } );
    } );
  }

  public bio () : TProfileBio {
    return this.cache( 'bio', () => Parser.container< TProfileBio >( {
      cv: { value: this.raw.bios, type: 'list', args: [ 'safeStr' ] },
      facts: { value: this.raw.abouts, type: 'list', args: [ 'safeStr' ] },
      quotes: { value: [], type: 'list', args: [ 'safeStr' ] }
    } ) );
  }

  public age () : number | undefined {
    return this.cache( 'age', () => Parser.strict( this.raw.birthDate, 'age' ) );
  }

  // --- financial assets ---

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

  // --- realtime data ---

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

  // --- (YTD) rank diff ---

  public rankDiff ( data?: Partial< TProfileData > ) : { flag: TChangeFlag, rankDiff?: number } {
    if ( this.rank() === undefined || ( this.networth() ?? 0 ) < 1000 ) return { flag: 'dropoff' };

    const item = data?.annual?.find( i => i.year === this.year() - 1 );
    if ( ! item ) return { flag: data?.annual?.filter( i => i.rank?.last !== undefined ).length ? 'returned' : 'new' };
    if ( item.rank?.last === undefined ) return { flag: 'unknown' };

    const rankDiff = item.rank.last - this.rank()!;
    return { flag: rankDiff > 0 ? 'up' : rankDiff < 0 ? 'down' : 'unchanged', rankDiff };
  }

  // --- aggregate stats ---

  public static stats ( data: Partial< TGenericStats > ) : TGenericStats {
    return Parser.container< TGenericStats >( {
      date: { value: data.date, type: 'string' },
      count: { value: data.count, type: 'number' },
      total: { value: data.total, type: 'money' },
      woman: { value: data.woman, type: 'number' },
      quota: { value: ( data.woman ?? 0 ) / ( data.count ?? 1 ) * 100, type: 'pct' },
      today: { value: Parser.container< TChangeItem >( {
        value: { value: data.today?.value, type: 'money' },
        percent: { value: data.today?.percent, type: 'pct' }
      } ), type: 'container' },
      ytd: { value: Parser.container< TChangeItem >( {
        value: { value: data.ytd?.value, type: 'money' },
        percent: { value: data.ytd?.percent, type: 'pct' }
      } ), type: 'container' }
    } );
  }
}
