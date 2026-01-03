import { Config } from '@/core/Config';
import { TFetchConfig } from '@/types/config';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class Fetch {

    private static instance: Fetch;
    private readonly config: TFetchConfig;
    private httpClient: AxiosInstance;

    private constructor () {
        this.config = Config.getInstance().fetch;
    }

    public static getInstance () {
        return Fetch.instance ||= new Fetch();
    }

}
