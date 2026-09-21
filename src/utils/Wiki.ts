import type { TProfileData } from '@rtbnext/schema/src/model/profile';
import { CmpStr, type CmpStrResult } from 'cmpstr';

import { Fetch } from '@/core/Fetch';
import { Image } from '@/core/Image';
import type { TWikidataResponseItem } from '@/type/response';


export class Wiki {
  private static readonly cmp = CmpStr.create( { metric: 'dice', safeEmpty: true, flags: 'i' } );
  private static readonly fetch = Fetch.getInstance();
  private static readonly image = Image.getInstance();

  private static readonly threshold = 0.85;

  private static scoreWDItem ( item: TWikidataResponseItem, data: Partial< TProfileData > ) : number {
    const { name: { fullName, shortName, firstName, lastName } = {}, gender, birthDate, citizenship } = data.info ?? {};
    let score = 0;

    // --- name matching ---
    const name = item.itemLabel.value.trim().toLowerCase();
    const test = [ fullName, shortName ].filter( Boolean ) as string[];

    if ( name === fullName?.toLowerCase() || name === shortName?.toLowerCase() ) score += 0.35;
    else if ( Wiki.cmp.match< CmpStrResult[] >( test, name, 0.8 ).length > 0 ) score += 0.2;
    else if (
      ( firstName && name.includes( firstName.toLowerCase() ) ) ||
      ( lastName && name.includes( lastName.toLowerCase() ) )
    ) score += 0.1;

    // --- birth date matching ---
    if ( birthDate && item.birthdate?.value.startsWith( birthDate ) ) score += 0.25;
    else if ( birthDate && item.birthdate?.value.startsWith( birthDate.substring( 0, 4 ) ) ) score += 0.1;
    else if ( birthDate && item.birthdate?.value ) score -= 0.5;

    // --- gender matching ---
    if ( gender && item.gender?.value.endsWith( gender === 'm' ? 'Q6581097' : gender === 'f' ? 'Q6581072' : '-' ) ) score += 0.15;
    else if ( gender && item.gender?.value ) return 0;

    // --- citizenship matching ---
    if ( citizenship && item.iso2?.value === citizenship.toUpperCase() ) score += 0.15;

    // --- article / image ---
    if ( item.article ) score += 0.05;
    if ( item.image ) score += 0.05;

    // --- occupation ---
    if ( [ 'Q131524', 'Q557880', 'Q911554', 'Q2462658' ].some( e => item.occupation?.value.endsWith( e ) ) ) score += 0.2;
    else if ( item.occupation ) score += 0.05;

    // --- economic relation ---
    if ( item.employer ?? item.ownerOf ) score += 0.1;
    if ( item.netWorth ) score += 0.2;

    return Math.min( 1, Math.max( 0, score ) );
  }
}
