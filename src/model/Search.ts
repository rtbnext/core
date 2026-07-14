import type { TProfileData, TProfileMetaData } from '@rtbnext/schema/src/model/profile';
import type { TSearchIndex, TSearchIndexItem } from '@rtbnext/schema/src/model/search';

import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import type { ISearch } from '@/interface/search';
import { Parser } from '@/parser/Parser';


export class Search implements ISearch {
  private static readonly storage = Storage.getInstance();
  private static instance: ISearch;

  private readonly path = 'profile/search.json';
  private index: TSearchIndexItem[] = [];
  private constructor () {}

  // --- save search index ---

  public save ( index: TSearchIndexItem[] ) : void {
    this.index = index;

    Search.storage.writeJSON< TSearchIndex >( this.path, {
      ...Utils.metaData(), count: this.index.length, items: this.index
    } );
  }

  // --- instantiate ---
  
  public static getInstance () : ISearch {
    return Search.instance ??= new Search();
  }

  // --- aggregate search index data ---

  public static aggregate ( data: TProfileData, meta: TProfileMetaData[ '$metadata' ], index: TSearchIndexItem[] ) : void {
    index.push( {
      id: data.id,
      uri: data.uri,

      deceased: data.info.flags.deceased ?? false,
      family: data.info.flags.family ?? false,
      dropOff: data.info.flags.dropOff ?? false,
      embargo: data.info.flags.embargo ?? false,

      searchName: Utils.normalizeSearchText( data.info.name.fullName ),
      fullName: data.info.name.fullName,
      lastName: data.info.name.lastName,

      gender: data.info.gender,
      birthDate: data.info.birthDate,
      age: Parser.age( data.info.birthDate ),

      birthCountry: data.info.birthPlace?.country,
      residenceCountry: data.info.residence?.country,
      citizenship: data.info.citizenship,

      industry: data.info.industry,
      source: data.info.source,
      networth: data.realtime?.networth,
      rank: data.realtime?.rank,

      organization: data.info.organization?.name,

      maritalStatus: data.info.maritalStatus,
      children: data.info.children,

      philanthropyScore: data.info.philanthropyScore,
      selfMade: data.info.selfMade?.is,
      selfMadeRank: data.info.selfMade?.rank,

      wikidata: data.wiki?.wikidata,

      status: meta.status?.status,
      score: meta.status?.score,

      timestamp: meta.lastModified
    } );
  }
}
