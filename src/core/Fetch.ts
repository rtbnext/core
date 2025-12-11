import { ConfigLoader } from '@/core/ConfigLoader';
import { FetchConfig } from '@/types/config';
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

    public async single ( urlLike: string, method: 'get' | 'post' = 'get', retries: number = 0 ) {}

    public async batch ( urlLike: string[], method: 'get' | 'post' = 'get' ) {}

    public async profile ( ...uri: string[] ) {}

    public async list ( list: string, year: string ) {}

    public static getInstance () {
        return Fetch.instance ||= new Fetch();
    }

}
