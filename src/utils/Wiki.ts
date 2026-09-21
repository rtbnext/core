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

    // --- name matching ---
    if ( shortName && item.itemLabel.value.trim() === shortName ) score += 0.25;
    else if ( shortName && item.itemLabel.value.trim().toLowerCase() === shortName.toLowerCase() ) score += 0.15;
    else return 0;

    // --- birth date matching ---
    if ( birthDate && item.birthdate?.value.startsWith( birthDate ) ) score += 0.25;
    else if ( birthDate && item.birthdate?.value.startsWith( birthDate.substring( 0, 4 ) ) ) score += 0.1;
    else if ( birthDate && item.birthdate?.value ) score -= 0.5;

    // --- gender matching ---
    if ( gender && item.gender?.value.endsWith( gender === 'm' ? 'Q6581097' : gender === 'f' ? 'Q6581072' : '-' ) ) score += 0.15;
    else if ( gender && item.gender?.value ) return 0;
  }
}
