import axios, { type AxiosInstance } from 'axios';

import type { IFetch } from '@/interface/fetch';
import type { TFetchConfig } from '@/type/config';
import { Config } from './Config';


export class Fetch implements IFetch {
  private static instance: Fetch;

  private readonly wikiQuery = { format: 'json', formatversion: 2 };
  private readonly config: TFetchConfig;
  private httpClient: AxiosInstance;

  private constructor () {
    this.config = Config.getInstance().fetch;
    this.httpClient = this.setupHttpClient();
  }

  // --- set up axios ---

  private setupHttpClient () : AxiosInstance {
    const { headers, rateLimit: { timeout } } = this.config;
    return axios.create( { headers, timeout } );
  }

  // --- randomize ---

  private getRandomUserAgent () : string {
    return this.config.agentPool[ Math.floor( Math.random() * this.config.agentPool.length ) ];
  }

  private getRandomDelay () : Promise< void > {
    const { max, min } = this.config.rateLimit.requestDelay;
    const delay = Math.round( Math.random() * ( max - min ) + min );

    return new Promise( resolve => setTimeout( resolve, delay ) );
  }

  // --- instantiate ---

  public static getInstance () : IFetch {
    return Fetch.instance ||= new Fetch();
  }
}
