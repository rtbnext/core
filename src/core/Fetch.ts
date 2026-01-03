import { Config } from '@/core/Config';
import { TFetchConfig } from '@/types/config';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class Fetch {

    private static instance: Fetch;
    private readonly config: TFetchConfig;
    private httpClient: AxiosInstance;

    private constructor () {
        this.config = Config.getInstance().fetch;
        this.httpClient = this.setupHttpClient();
    }

    private setupHttpClient () : AxiosInstance {
        const { headers, rateLimit: { timeout } } = this.config;
        return axios.create( { headers, timeout } );
    }

    private getRandomUserAgent () : string {
        return this.config.agentPool[ Math.floor(
            Math.random() * this.config.agentPool.length
        ) ];
    }

    private getRandomDelay () : Promise< void > {
        const { max, min } = this.config.rateLimit.requestDelay;
        const delay = Math.round( Math.random() * ( max - min ) + min );
        return new Promise( resolve => setTimeout( resolve, delay ) );
    }

    public static getInstance () {
        return Fetch.instance ||= new Fetch();
    }

}
