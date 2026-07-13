import type { TLocation, TOrganization, TSelfMade } from '@rtbnext/schema/src/base/generic';
import type { TProfileBio, TProfileFlags, TProfileInfo, TProfileName } from '@rtbnext/schema/src/model/profile';
import type { TGenericStats } from '@rtbnext/schema/src/model/stats';

import { Utils } from '@/core/Utils';
import type { IPersonListParser } from '@/interface/parser';
import { ListParser } from '@/parser/ListParser';
import { Parser } from '@/parser/Parser';
import { ProfileParser } from '@/parser/ProfileParser';
import type { TPreparedList } from '@/type/list';
import type { TListResponse, TPersonListEntry, TResponse } from '@/type/response';


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
    return this.cache( 'rank', () => Parser.strict( this.raw.rank ?? this.raw.position, 'number' ) );
  }

  public networth () : number | undefined {
    return this.cache( 'networth', () => Parser.strict( this.raw.finalWorth, 'money' ) || undefined );
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
      flags: Parser.container< TProfileFlags >( {
        dropOff: { value: this.dropOff(), type: 'boolean' },
        family: { value: this.name().family, type: 'boolean' }
      } ),
      ...Parser.container< Partial< TProfileInfo > >( {
        gender: { value: this.raw.gender, type: 'gender' },
        birthDate: { value: this.raw.birthDate, type: 'date' },
        citizenship: { value: this.raw.countryOfCitizenship, type: 'country' },
        industry: { value: this.raw.industries?.[ 0 ], type: 'industry' },
        source: { value: this.raw.source, type: 'list' }
      } ),
      name: this.name().name,
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
        rank: { value: this.raw.selfMadeRank, type: 'clamp', args: [ [ 1, 10 ] ] }
      } );
    } );
  }

  public philanthropyScore () : number | undefined {
    return this.cache( 'philanthropyScore', () => Parser.strict< number >( this.raw.philanthropyScore, 'clamp', [ 0, 5 ] ) );
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

  // --- prepare raw list data ---

  public static prepareList (
    res: TResponse< TListResponse< TPersonListEntry > >, filter?: ( item: TPersonListEntry ) => boolean
  ) : TPreparedList< TPersonListEntry > {
    if ( ! res?.success || ! res.data ) throw new Error( 'Response does not contain valid list data' );

    const rawList = res.data.personList.personsLists;
    const entries = rawList.filter( filter ?? Boolean ).filter( Boolean )
      .sort( ( a, b ) => ( a.rank ?? a.position ?? Infinity ) - ( b.rank ?? b.position ?? Infinity ) );

    if ( ! entries.length ) throw new Error( 'Response does not contain any valid list entries' );
    return { rawData: res.data, rawList, entries };
  }

  // --- prepare stats ---

  public static stats ( data: Partial< TGenericStats > ) : TGenericStats {
    return Parser.container< TGenericStats >( {
      date: { value: data.date, type: 'string' },
      count: { value: data.count, type: 'number' },
      total: { value: data.total, type: 'money' },
      woman: { value: data.woman, type: 'number' },
      quota: { value: ( data.woman ?? 0 ) / ( data.count ?? 1 ) * 100, type: 'pct' }
    } );
  }
}
