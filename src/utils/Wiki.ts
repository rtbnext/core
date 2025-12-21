import { Fetch } from '@/core/Fetch';
import { TProfileData } from '@/types/profile';
import { TWikidataResponseItem, TWikidataResponse } from '@/types/response';
import { Gender } from '@/utils/Const';

export class Wiki {
    
    private static readonly fetch = Fetch.getInstance();

    private static scoreWDItem (
        item: TWikidataResponseItem, name: string, birth?: string, gender?: Gender
    ) : number {
        let score = 0;

        if ( item.itemLabel.value === name ) score += 40;
        else if ( item.itemLabel?.value ) score += 25;

        if ( birth && item.birthdate?.value.startsWith( birth ) ) score += 30;
        if ( gender ) score += 10;

        if ( item.article ) score += 10;
        if ( item.image ) score += 10;

        return score;
    }

    public static async queryWikiData ( data: Partial< TProfileData > ) : Promise< {
        qid: string, article?: string, image?: string, score: number
    } | false > {
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

        const res = await Wiki.fetch.wikidata< TWikidataResponse >( sparql );
        let best: { score: number, item: TWikidataResponseItem } | undefined;

        for ( const item of res.data?.results.bindings ?? [] ) {
            const score = Wiki.scoreWDItem( item, shortName, birthDate, gender );
            if ( ! best || score > best.score ) best = { score, item };
        }

        return ( ! best || best.score < 50 ) ? false : {
            qid: best.item.item.value.split( '/' ).pop()!,
            article: best.item.article?.value.split( '/' ).pop(),
            image: best.item.image?.value.split( '/' ).pop(),
            score: best.score
        };
    }

}
