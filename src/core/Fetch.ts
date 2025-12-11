import { ConfigLoader } from '@/core/ConfigLoader';
import { FetchConfig } from '@/types/config';
import axios, { AxiosInstance } from 'axios';

export class Fetch {

    private static instance: Fetch;
    private readonly config: FetchConfig;
    private httpClient: AxiosInstance;

    private constructor () {
        this.config = ConfigLoader.getInstance().fetch;
        this.httpClient = this.setupHttpClient();
    }

    private setupHttpClient () : AxiosInstance {
        const { baseUrl: baseURL, headers, rateLimit: { timeout } } = this.config;
        return axios.create( { baseURL, headers, timeout } );
    }

    public static getInstance () {
        return Fetch.instance ||= new Fetch();
    }

}
