import { ConfigLoader } from '@/core/ConfigLoader';
import { FetchConfig } from '@/types/config';
import { Response } from '@/types/response';
import { Logger } from '@/utils/Logger';
import axios, { AxiosInstance } from 'axios';

export class Fetch {

    private static instance: Fetch;
    private readonly logger: Logger;
    private readonly config: FetchConfig;
    private httpClient: AxiosInstance;

    private constructor () {
        this.logger = Logger.getInstance();
        this.config = ConfigLoader.getInstance().fetch;
        this.httpClient = this.setupHttpClient();
    }

    private setupHttpClient () : AxiosInstance {
        const { baseUrl: baseURL, headers, rateLimit: { timeout } } = this.config;
        return axios.create( { baseURL, headers, timeout } );
    }

    private getRandomUserAgent () : string {
        return this.config.agentPool[ Math.floor( Math.random() * this.config.agentPool.length ) ];
    }

    private getRandomDelay () : Promise< void > {
        const { max, min } = this.config.rateLimit.requestDelay;
        const delay = Math.random() * ( max - min ) + min;
        return new Promise( resolve => setTimeout( resolve, delay ) );
    }

    public async single< T > (
        urlLike: string, method: 'get' | 'post' = 'get', retries: number = 0
    ) : Promise< Response< T > > {}

    public async batch (
        urlLike: string[], method: 'get' | 'post' = 'get'
    ) : Promise< Response< T >[] > {}

    public async profile ( ...uri: string[] ) : Promise< Response< T >[] > {}

    public async list ( list: string, year: string ) : Promise< Response< T > > {}

    public static getInstance () {
        return Fetch.instance ||= new Fetch();
    }

}
