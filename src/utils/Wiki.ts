import type { TProfileData } from '@rtbnext/schema/src/model/profile';

import { Fetch } from '@/core/Fetch';
import { log } from '@/core/Logger';
import { Parser } from '@/parser/Parser';
import type { TWikidataResponse, TWikidataResponseItem } from '@/type/response';
import type { TWikidata } from '@/type/wiki';


export class Wiki {
  private static readonly fetch = Fetch.getInstance();

  private static scoreWDItem ( item: TWikidataResponseItem, data: Partial< TProfileData > ) : number {
    const { name: { shortName } = {}, gender, birthDate, citizenship } = data.info ?? {};
    let score = 0;

    // --- name matching ---
    if ( item.itemLabel.value.trim() === shortName ) score += 0.2;
    else if ( item.itemLabel.xmlLang === 'en' ) score += 0.1;
    else score += 0.1;

    // --- birthdate matching ---
    if ( birthDate && item.birthdate?.value.startsWith( birthDate ) ) score += 0.2;
    else if ( birthDate && item.birthdate?.value.startsWith( birthDate.substring( 0, 4 ) ) ) score += 0.1;
    else if ( birthDate && item.birthdate?.value ) score -= 0.1;

    // --- gender matching ---
    if ( gender && item.gender?.value.endsWith( gender === 'm' ? 'Q6581097' : gender === 'f' ? 'Q6581072' : '-' ) ) score += 0.1;
    else if ( score && item.gender?.value ) score -= 0.2;

    // --- citizenship matching ---
    if ( citizenship && item.iso2?.value === citizenship.toUpperCase() ) score += 0.2;

    // --- media matching ---
    if ( item.article ) score += 0.1;
    if ( item.image ) score += 0.05;

    // --- occupation matching ---
    if ( [ 'Q131524', 'Q557880', 'Q911554', 'Q2462658' ].some( e => item.occupation?.value.endsWith( e ) ) ) score += 0.2;
    else if ( item.occupation ) score += 0.05;

    // --- economic matching ---
    if ( item.employer || item.ownerOf ) score += 0.1;
    if ( item.netWorth ) score += 0.2;

    return Math.min( 1, Math.max( 0, score ) );
  }

  public static async queryWikidata ( data: Partial< TProfileData > ) : Promise< TWikidata | undefined > {
    log.debug( `Querying Wikidata for: ${ data.info?.name?.shortName }` );

    return await log.catchAsync( async () => {
      const shortName = data.info?.name?.shortName;
      if ( ! shortName ) throw new Error( 'No short name provided' );

      const [ first, ...rest ] = shortName.split( ' ' ), last = rest.pop();
      const nameVariants = [ shortName, `${ first[ 0 ] }. ${ last }`, `${ first } ${ last }` ]
        .filter( Boolean ).map( n => `"${ n }"@en "${ n }"@de` ).join( ' ' );

      const sparql = `
        SELECT DISTINCT
          ?item ?itemLabel ?gender ?birthdate ?article ?image ?iso2
          ?occupation ?employer ?ownerOf ?netWorth
        WHERE {
          VALUES ?name { ${ nameVariants } }
          ?item wdt:P31 wd:Q5 .
          { { ?item rdfs:label ?name . } UNION { ?item skos:altLabel ?name . } }
          OPTIONAL { ?item wdt:P21 ?gender . }
          OPTIONAL { ?item wdt:P569 ?birthdate . }
          OPTIONAL {
            ?article schema:about ?item ;
            schema:isPartOf <https://en.wikipedia.org/> .
          }
          OPTIONAL { ?item wdt:P18 ?image . }
          OPTIONAL { ?item wdt:P27 ?country . ?country wdt:P297 ?iso2 . }
          OPTIONAL { ?item wdt:P106 ?occupation . }
          OPTIONAL { ?item wdt:P108 ?employer . }
          OPTIONAL { ?item wdt:P169 ?employer . }
          OPTIONAL { ?item wdt:P127 ?ownerOf . }
          OPTIONAL { ?item wdt:P1830 ?ownerOf . }
          OPTIONAL { ?item wdt:P2218 ?netWorth . }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en,de" . }
        }
        LIMIT 20
      `;

      const res = await Wiki.fetch.wikidata< TWikidataResponse >( sparql );
      let best: { score: number, item: TWikidataResponseItem } | undefined;

      for ( const item of res.data?.results.bindings ?? [] ) {
        const score = Wiki.scoreWDItem( item, data );

        if ( ! best || score > best.score ) best = { score, item };
        if ( best.score === 1 ) break;
      }

      if ( ! best || best.score < 0.65 ) throw new Error( 'No suitable Wikidata item found' );
      log.debug( `Best Wikidata item for ${ shortName } has score: ${ best.score }` );

      return Parser.container< TWikidata >( {
        qid: { value: best.item.item.value.split( '/' ).pop()!, type: 'string' },
        confidence: { value: best.score, type: 'number', args: [ 3 ] },
        article: { value: best.item.article?.value.split( '/' ).pop(), type: 'decodeURI' },
        image: { value: best.item.image?.value.split( '/' ).pop(), type: 'decodeURI' }
      } );
    }, `Failed to query Wikidata for: ${ data.info?.name?.shortName ?? 'unknown' }` );
  }
}
