import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';

import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { Utils } from '@/core/Utils';
import type { IFetch } from '@/interface/fetch';
import type { TFetchConfig } from '@/type/config';
import type { TResponse } from '@/type/response';


export class Fetch implements IFetch {
  private static instance: Fetch;

  private readonly config: TFetchConfig;
  private readonly wikiQuery = { format: 'json', formatversion: 2 };
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

  // --- fetch ---

  private async fetch < T > ( url: string, method: 'get' | 'post' = 'get' ) : Promise< TResponse< T > > {
    log.debug( `Fetching URL: ${ url } via ${ method.toUpperCase() }` );

    const { result: res, ms } = await Utils.measure( async () => {
      let res: AxiosResponse< T, any, {} >;
      let retries = 0;

      do {
        const headers = { ...this.config.headers, 'User-Agent': this.getRandomUserAgent() };
        res = await this.httpClient[ method ]< T >( url, { headers } );
        if ( res.status === 200 && res.data ) break;

        log.warn( `Request failed with status: ${ res.status }. Retrying ...` );
        await this.getRandomDelay();
      } while ( ++retries < this.config.rateLimit.retries );

      return { ...res, retries };
    } );

    log.debug( `Fetched URL: ${ url } in ${ ms } ms` );

    return Object.assign( { duration: ms, retries: res.retries },
      res.status === 200 && res.data ? { success: true, data: res.data } : {
        success: false, error: `Invalid response status: ${ res.status }`,
        statusCode: res.status
      }
    );
  }

  // --- instantiate ---

  public static getInstance () : IFetch {
    return Fetch.instance ||= new Fetch();
  }
}
