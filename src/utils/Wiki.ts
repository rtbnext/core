import { Fetch } from '@/core/Fetch';
import { TImage, TWiki, TWikiData } from '@/types/generic';
import { TProfileData } from '@/types/profile';
import { TWikiDataResponse, TWikiDataResponseItem, TWikipediaResponse } from '@/types/response';
import { Gender } from '@/utils/Const';
import { Parser } from '@/utils/Parser';

export class Wiki {
    
    private static readonly fetch = Fetch.getInstance();

    private static scoreWDItem (
        item: TWikiDataResponseItem, name: string, birth?: string, gender?: Gender
    ) : number {
        let score = 0;

        if ( item.itemLabel.value === name ) score += 0.4;
        else if ( item.itemLabel?.value ) score += 0.25;

        if ( birth && item.birthdate?.value.startsWith( birth ) ) score += 0.3;
        if ( gender ) score += 0.1;

        if ( item.article ) score += 0.1;
        if ( item.image ) score += 0.1;

        return score;
    }

    public static async queryWikiData ( data: Partial< TProfileData > ) : Promise< TWikiData | false > {
        const { shortName, gender, birthDate } = data.info!;
        if ( ! shortName ) return false;

        const genderQ = gender === 'm' ? 'wd:Q6581097' : gender === 'f' ? 'wd:Q6581072' : undefined;
        const genderFilter = genderQ ? `?item wdt:P21 ${genderQ} .` : '';
        const birthDateFilter = birthDate
            ? `?item wdt:P569 ?birthdate . FILTER( STRSTARTS( STR(?birthdate), "${birthDate}" ) )`
            : `OPTIONAL { ?item wdt:P569 ?birthdate . }`;

        const sparql = `SELECT ?item ?itemLabel ?birthdate ?article ?image WHERE {` +
            `?item wdt:P31 wd:Q5 . {` +
                `{ ?item rdfs:label "${shortName}"@en . }` +
                `UNION { ?item skos:altLabel "${shortName}"@en . }` +
            `}` + genderFilter + birthDateFilter +
            `OPTIONAL { ?item wdt:P18 ?image . }` +
            `OPTIONAL { ?article schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> . }` +
            `SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }` +
        `} LIMIT 10`;

        const res = await Wiki.fetch.wikidata< TWikiDataResponse >( sparql );
        let best: { score: number, item: TWikiDataResponseItem } | undefined;

        for ( const item of res.data?.results.bindings ?? [] ) {
            const score = Wiki.scoreWDItem( item, shortName, birthDate, gender );
            if ( ! best || score > best.score ) best = { score, item };
        }

        return ( ! best || best.score < 0.5 ) ? false : Parser.container< TWikiData >( {
            qid: { value: best.item.item.value.split( '/' ).pop()!, method: 'string' },
            article: { value: best.item.article?.value.split( '/' ).pop(), method: 'decodeURI' },
            image: { value: best.item.image?.value.split( '/' ).pop(), method: 'decodeURI' },
            score: { value: best.score, method: 'number', args: [ 1 ] }
        } );
    }

    public static async queryWikiPage ( title: string, qid?: string ) : Promise< TWiki | false > {
        const res = await Wiki.fetch.wikipedia< TWikipediaResponse >( {
            action: 'query', prop: 'extracts|info|pageprops', titles: title, redirects: 1,
            exintro: 1, explaintext: 1, exsectionformat: 'plain'
        } );

        if ( ! res?.success || ! res.data || ! res.data.query.pages.length ) return false;
        const raw = res.data.query.pages[ 0 ];

        return Parser.container< TWiki >( {
            uri: { value: title, method: 'string' },
            pageId: { value: raw.pageid, method: 'number' },
            refId: { value: raw.lastrevid, method: 'number' },
            name: { value: raw.title, method: 'string' },
            lastModified: { value: raw.touched, method: 'date', args: [ 'iso' ] },
            summary: { value: raw.extract ?? '', method: 'list', args: [ '\n' ], strict: false },
            sortKey: { value: raw.pageprops?.defaultsort, method: 'string' },
            wikidata: { value: qid, method: 'string' },
            desc: { value: raw.pageprops?.[ 'wikibase-shortdesc' ], method: 'string' }
        } );
    }

    public static async queryCommonsImage ( title: string ) : Promise< TImage | false > {
        return false;
    }

}
