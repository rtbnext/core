import type { TAsset, TRealtime } from '@rtbnext/schema/src/base/assets';
import type { TChangeFlag } from '@rtbnext/schema/src/base/const';
import type { TEducation, TImage, TLocation, TOrganization, TRelation, TSelfMade } from '@rtbnext/schema/src/base/generic';
import type { TProfileBio, TProfileFlags, TProfileInfo, TProfileName } from '@rtbnext/schema/src/model/profile';

import type { ICache } from '@/type/cache';
import type { TPersonListEntry, TProfileResponse } from '@/type/response';


export interface IProfileParser extends ICache {
  rawData () : TProfileResponse[ 'person' ];
  sortedLists () : TProfileResponse[ 'person' ][ 'personLists' ];
  uri () : string;
  id () : string;
  aliases () : string[];
  name () : { name: TProfileName, family: boolean };
  flags () : TProfileFlags;
  info () : TProfileInfo;
  citizenship () : string | undefined;
  residence () : TLocation | undefined;
  birthPlace () : TLocation | undefined;
  education () : TEducation[];
  selfMade () : TSelfMade;
  philanthropyScore () : number | undefined;
  organization () : TOrganization | undefined;
  bio () : TProfileBio;
  cv () : string[];
  facts () : string[];
  quotes () : string[];
  related () : TRelation[];
  media () : TImage[];
}

export interface IListParser< T extends object > extends ICache {
  rawData () : T;
}

export interface IPersonListParser extends IListParser< TPersonListEntry > {
  uri () : string;
  id () : string;
  date () : string;
  year () : number;
  rank () : number | undefined;
  networth () : number | undefined;
  dropOff () : boolean | undefined;
  name () : { name: TProfileName, family: boolean };
  info () : Partial< TProfileInfo >;
  residence () : TLocation | undefined;
  selfMade () : TSelfMade | undefined;
  philanthropyScore () : number | undefined;
  organization () : TOrganization | undefined;
  bio () : TProfileBio;
  age () : number | undefined;
}

export interface IRTBListParser extends IPersonListParser {
  assets () : TAsset[];
  realtime ( data?: Partial< TProfileData >, prev?: string, next?: string ) : TRealtime | undefined;
  rankDiff ( data?: Partial< TProfileData > ) : { flag: TChangeFlag, rankDiff?: number };
}

export interface IBillionairesListParser extends IPersonListParser {}
