import type { TChangeItem } from '@rtbnext/schema/src/base/assets';
import type { TLocation, TOrganization, TSelfMade } from '@rtbnext/schema/src/base/generic';
import type { TProfileBio, TProfileInfo, TProfileName } from '@rtbnext/schema/src/model/profile';
import type { TGenericStats } from '@rtbnext/schema/src/model/stats';

import { Utils } from '@/core/Utils';
import type { IPersonListParser } from '@/interface/parser';
import { ListParser } from '@/parser/ListParser';
import { Parser } from '@/parser/Parser';
import { ProfileParser } from '@/parser/ProfileParser';
import type { TPersonListEntry } from '@/type/response';


export class PersonListParser extends ListParser< TPersonListEntry > implements IPersonListParser {
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
    return this.cache( 'philanthropyScore', () => Parser.strict( this.raw.philanthropyScore, 'number' ) );
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
