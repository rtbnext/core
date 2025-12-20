import { Fetch } from '@/core/Fetch';
import { TImage, TWiki } from '@/types/generic';
import { Parser } from '@/utils/Parser';
import { CmpStr, CmpStrResult } from 'cmpstr';

export class Wiki {

    private static readonly fetch = Fetch.getInstance();
    private static readonly cmp = CmpStr.create( { metric: 'dice' } );

    private static async search ( query: string ) : Promise< string | false > {
        const res = await Wiki.fetch.wiki< [ string, string[], string[], string[] ] >( {
            action: 'opensearch', search: query, namespace: 0, redirects: 'resolve'
        } );

        return Wiki.cmp.match< CmpStrResult[] >(
            res.data?.[ 1 ] ?? [], query, 0.9
        )[ 0 ]?.source || false;
    }

    private static async getImage ( uri: string ) : Promise< TImage | undefined > {
        return;
    }

    private static async getPage ( title: string ) : Promise< TWiki | false > {
        const res = await Wiki.fetch.wiki< { query: { pages: {
            pageid: number, title: string, extract?: string, touched: string,
            lastrevid: number, pageimage?: string, pageprops?: {
                defaultsort?: string, 'wikibase-shortdesc'?: string, wikibase_item?: string
            }, thumbnail?: { source: string }, original?: { source: string }
        }[] } } >( {
            action: 'query', prop: 'extracts|info|pageprops|pageimages', titles: title,
            exintro: 1, explaintext: 1, exsectionformat: 'plain',
            piprop: 'thumbnail|name|original', pilimit: 1
        } );

        if ( ! res?.success || ! res.data || ! res.data.query.pages.length ) return false;

        const raw = res.data.query.pages[ 0 ];
        const data: TWiki = {
            pageId: Parser.number( raw.pageid ),
            refId: Parser.number( raw.lastrevid ),
            name: Parser.string( raw.title ),
            lastModified: Parser.date( raw.touched, 'iso' )!,
            summary: Parser.list( raw.extract ?? '', '\n' ) as string[]
        };

        if ( raw.pageprops?.defaultsort )
            data.sortKey = Parser.string( raw.pageprops.defaultsort );
        if ( raw.pageprops?.wikibase_item )
            data.wikidata = Parser.string( raw.pageprops.wikibase_item );
        if ( raw.pageprops?.[ 'wikibase-shortdesc' ] )
            data.desc = Parser.string( raw.pageprops[ 'wikibase-shortdesc' ] );
        if ( raw.pageimage )
            data.image = await this.getImage( raw.pageimage );

        return data;
    }

    public static async profile ( name: string ) : Promise< TWiki | false > {
        const title = await this.search( name );
        return title ? await this.getPage( title ) : false;
    }

}
