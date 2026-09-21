import type { TImage } from '@rtbnext/schema/src/base/generic';
import type { TProfileData } from '@rtbnext/schema/src/model/profile';
import { CmpStr, type CmpStrResult } from 'cmpstr';

import { Fetch } from '@/core/Fetch';
import { Image } from '@/core/Image';
import { log } from '@/core/Logger';
import { Parser } from '@/parser/Parser';
import type { TCommonsResponse, TWikidataResponse, TWikidataResponseItem } from '@/type/response';
import type { TWikidata } from '@/type/wiki';


export class Wiki {
  private static readonly cmp = CmpStr.create( { metric: 'dice', safeEmpty: true, flags: 'i' } );
  private static readonly fetch = Fetch.getInstance();
  private static readonly image = Image.getInstance();

  private static readonly threshold = 0.85;
  private static readonly wdItems = 25;

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
    else if ( birthDate && item.birthdate?.value ) score -= 0.2;

    // --- gender matching ---
    if ( gender && item.gender?.value.endsWith( gender === 'm' ? 'Q6581097' : gender === 'f' ? 'Q6581072' : '-' ) ) score += 0.15;
    else if ( gender && item.gender?.value ) score -= 0.5;

    // --- citizenship matching ---
    if ( citizenship && item.iso2?.value === citizenship.toUpperCase() ) score += 0.15;

    // --- article / image ---
    if ( item.article ) score += 0.05;
    if ( item.image ) score += 0.05;

    // --- occupation ---
    if ( [ 'Q131524', 'Q557880', 'Q911554', 'Q2462658' ].some( e => item.occupation?.value.endsWith( e ) ) ) score += 0.25;
    else if ( item.occupation ) score += 0.05;

    // --- economic relation ---
    if ( item.employer ?? item.ownerOf ) score += 0.2;
    if ( item.netWorth ) score += 0.25;

    return Math.max( 0, score );
  }

  public static async queryWikidata ( data: Partial< TProfileData > ) : Promise< TWikidata | undefined > {
    log.debug( `Querying Wikidata for: ${ data.info?.name?.shortName ?? 'unknown' }` );

    return await log.catchAsync( async () => {
      const shortName = data.info?.name?.shortName;
      if ( ! shortName ) throw new Error( 'No short name provided' );

      const [ first, ...rest ] = shortName.split( ' ' ), last = rest.pop();
      const nameVariants = [ shortName, `${ first[ 0 ] }. ${ last }`, `${ first } ${ last }` ]
        .filter( Boolean ).map( n => `"${ n }"@en "${ n }"@de` ).join( ' ' );

      const sparql = `
        SELECT DISTINCT
          ?item ?itemLabel ?gender ?birthdate ?article ?image ?iso2 ?occupation ?employer ?ownerOf ?netWorth
        WHERE {
          VALUES ?name { ${ nameVariants } }
          ?item wdt:P31 wd:Q5 .
          { { ?item rdfs:label ?name . } UNION { ?item skos:altLabel ?name . } }
          OPTIONAL { ?item wdt:P21 ?gender . }
          OPTIONAL { ?item wdt:P569 ?birthdate . }
          OPTIONAL { ?article schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> . }
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
        LIMIT ${ Wiki.wdItems }
      `;

      const res = await Wiki.fetch.wikidata< TWikidataResponse >( sparql );
      let best: { score: number, item: TWikidataResponseItem } | undefined;

      for ( const item of res.data?.results.bindings ?? [] ) {
        const score = Wiki.scoreWDItem( item, data );
        if ( ! best || score > best.score ) best = { score, item };
      }

      if ( ! best || best.score < Wiki.threshold ) throw new Error( 'No suitable Wikidata item found' );
      log.debug( `Best Wikidata item for ${ shortName } has score: ${ best.score }` );

      return Parser.container< TWikidata >( {
        qid: { value: best.item.item.value.split( '/' ).pop()!, type: 'string' },
        confidence: { value: best.score, type: 'number', args: [ 3 ] },
        article: { value: best.item.article?.value.split( '/' ).pop(), type: 'decodeURI' },
        image: { value: best.item.image?.value.split( '/' ).pop(), type: 'decodeURI' }
      } );
    }, `Failed to query Wikidata for: ${ data.info?.name?.shortName ?? 'unknown' }` );
  }

  public static async queryCommonsImage ( uri: string, title: string ) : Promise< TImage | undefined > {
    log.debug( `Querying Wikimedia Commons image: ${ title }` );

    return await log.catchAsync( async () => {
      const res = await Wiki.fetch.commons< TCommonsResponse >( {
        action: 'query', titles: `File:${ title }`, prop: 'imageinfo', redirects: 1,
        iiprop: 'url|extmetadata', iiurlwidth: 400
      } );

      const info = res.data?.query.pages?.[ 0 ]?.imageinfo?.[ 0 ];
      if ( ! info ) throw new Error( `No image info found for: ${ title }` );

      log.debug( `Wikimedia Commons image info received for: ${ title }` );

      const file = await Wiki.fetch.download( info.url );
      if ( ! file.success || ! file.data ) throw new Error( `Failed to download image: ${ title }` );

      const thumbUrl = info.thumburl ?? Object.values( info.responsiveUrls ?? {} ).at( 0 );
      const thumb = thumbUrl ? await Wiki.fetch.download( thumbUrl ) : undefined;

      if ( thumbUrl && ( ! thumb?.success || ! thumb.data ) )
        throw new Error( `Failed to download image thumbnail: ${ title }` );

      if ( ! Wiki.image.save( uri, { buffer: file.data, filename: info.url },
        thumb?.data ? { buffer: thumb.data, filename: thumbUrl! } : undefined
      ) ) throw new Error( `Failed to save image: ${ title }` );

      const meta = info.extmetadata ?? {};
      const dateTime = meta.DateTimeOriginal?.value ?? meta.DateTime?.value;
      const credits = Parser.list( [
        meta.Attribution?.value ?? meta.Artist?.value ?? meta.Credit?.value,
        meta.LicenseShortName?.value ?? meta.UsageTerms?.value,
        'via Wikimedia Commons'
      ] ).join( ', ' );

      return Parser.container< TImage >( {
        url: { value: info.descriptionurl, type: 'string' },
        file: { value: info.url, type: 'string' },
        thumb: { value: thumbUrl, type: 'string' },
        caption: { value: meta.ImageDescription?.value, type: 'text' },
        date: { value: dateTime, type: 'date', args: [ 'iso' ] },
        credits: { value: credits, type: 'text' }
      } );
    }, `Failed to load Wikimedia Commons image: ${ title }` ) ?? undefined;
  }
}
