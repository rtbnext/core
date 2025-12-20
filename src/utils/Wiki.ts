import { Fetch } from '@/core/Fetch';
import { TWiki } from '@/types/generic';
import { CmpStr, CmpStrResult } from 'cmpstr';

export class Wiki {

    private static readonly fetch = Fetch.getInstance();
    private static readonly cmp = CmpStr.create( { metric: 'dice' } );

    private static async search ( query: string ) : Promise< string | false > {
        const res = await Wiki.fetch.wiki< [ string, string[], string[], string[] ] >( {
            action: 'opensearch', search: query, namespace: '0', redirects: 'resolve'
        } );

        return Wiki.cmp.match< CmpStrResult[] >(
            res.data?.[ 1 ] ?? [], query, 0.9
        )[ 0 ]?.source || false;
    }

    private static async getPage ( title: string, ns: number = 0 ) {}

    private static async getImage () {}

    public static async profile ( name: string ) : Promise< TWiki | undefined > {
        const title = this.search( name );
        if ( ! title ) return;
    }

}
