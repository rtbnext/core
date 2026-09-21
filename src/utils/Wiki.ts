import type { TProfileData } from '@rtbnext/schema/src/model/profile';

import { Fetch } from '@/core/Fetch';
import { Image } from '@/core/Image';
import type { TWikidataResponseItem } from '@/type/response';


export class Wiki {
  private static readonly fetch = Fetch.getInstance();
  private static readonly image = Image.getInstance();

  private static scoreWDItem (
    item: TWikidataResponseItem,
    data: Partial< TProfileData >
  ) : number {
    const { name: { shortName } = {}, gender, birthDate, citizenship } = data.info ?? {};
    let score = 0;
  }
}
