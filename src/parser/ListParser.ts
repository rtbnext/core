import { Cache } from '@/abstract/Cache';
import { Utils } from '@/core/Utils';
import type { IListParser } from '@/interface/parser';
import { Parser } from '@/parser/Parser';
import { ProfileParser } from '@/parser/ProfileParser';
import type { TPersonListEntry } from '@/type/response';
import { TProfileName } from '@rtbnext/schema/src/model/profile';


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
}
