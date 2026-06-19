import type { TEducation, TImage, TLocation, TOrganization, TRelation, TSelfMade } from '@rtbnext/schema/src/base/generic';
import type { TProfileBio, TProfileFlags, TProfileInfo, TProfileName } from '@rtbnext/schema/src/model/profile';

import type { ICache } from '@/type/cache';
import type { TProfileResponse } from '@/type/response';


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
