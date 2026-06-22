import type { TAsset } from '@rtbnext/schema/src/base/assets';
import type { TProfileBio, TProfileInfo, TProfileName } from '@rtbnext/schema/src/model/profile';

import { Cache } from '@/abstract/Cache';
import { Utils } from '@/core/Utils';
import type { IListParser } from '@/interface/parser';
import { Parser } from '@/parser/Parser';
import { ProfileParser } from '@/parser/ProfileParser';
import type { TPersonListEntry } from '@/type/response';


export class ListParser< T extends object > extends Cache implements IListParser< T > {
  constructor ( protected readonly raw: T ) { super() }
  public rawData () : T { return this.raw }
}

export class PersonListParser extends ListParser< TPersonListEntry > {
  public uri () : string {
    return this.cache( 'uri', () => Utils.sanitize( this.raw.uri ) );
  }

  public id () : string {
    return this.cache( 'id', () => Utils.hash( this.raw.naturalId ) );
  }

  // --- basic fields ---

  public date () : string {
    return this.cache( 'date', () => Parser.date( this.raw.date || this.raw.timestamp, 'ymd' )! );
  }

  public rank () : number | undefined {
    return this.cache( 'rank', () => Parser.strict( this.raw.rank, 'number' ) );
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

  // --- (partial) profile data ---

  public info () : Partial< TProfileInfo > {
    return this.cache( 'info', () => ( {
      flags: { dropOff: this.dropOff() }, ...this.name(),
      ...Parser.container< Partial< TProfileInfo > >( {
        gender: { value: this.raw.gender, type: 'gender' },
        birthDate: { value: this.raw.birthDate, type: 'date' },
        citizenship: { value: this.raw.countryOfCitizenship, type: 'country' },
        industry: { value: this.raw.industries?.[ 0 ], type: 'industry' },
        source: { value: this.raw.source, type: 'list' }
      } )
    } ) );
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
        value: { value: a.numberOfShares && ( a.currentPrice || a.sharePrice )
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
}
