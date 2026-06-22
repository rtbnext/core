import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';

import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { Utils } from '@/core/Utils';
import type { IFetch } from '@/interface/fetch';
import type { TFetchConfig } from '@/type/config';
import type { TFetchMethod, THeader } from '@/type/fetch';
import type { TResponse } from '@/type/response';


export class Fetch implements IFetch {
  private static instance: IFetch;

  private readonly config: TFetchConfig;
  private lastRequest: number = 0;
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

  // --- rate limit ---

  private getRandomDelay () : Promise< void > {
    const { max, min } = this.config.rateLimit.requestDelay;
    const delay = Math.round( Math.random() * ( max - min ) + min );

    return new Promise( resolve => setTimeout( resolve, delay ) );
  }

  private async applyRateLimit < T > ( fn: () => Promise< T > ) : Promise< T > {
    if ( Date.now() - this.lastRequest < this.config.rateLimit.idle ) await this.getRandomDelay();

    try { return await fn() }
    finally { this.lastRequest = Date.now() }
  }

  // --- headers ---

  private useApiAgent () : THeader {
    return { 'User-Agent': this.config.apiAgent, 'Api-User-Agent': this.config.apiAgent };
  }

  private useRandomUserAgent () : THeader {
    return { 'User-Agent': this.config.agentPool[ Math.floor( Math.random() * this.config.agentPool.length ) ] };
  }

  // --- helper ---

  private prepQuery ( url: string, replacements: Record< string, unknown > ) : string {
    return Object.entries( replacements ).reduce( ( acc, [ key, value ] ) => {
      return acc.replaceAll( `{${ key.toUpperCase() }}`, String( value ) );
    }, url );
  }

  private async fetch < T > ( url: string, method: TFetchMethod = 'get', headers?: THeader ) : Promise< TResponse< T > > {
    log.debug( `Fetching URL: ${ url } via ${ method.toUpperCase() }` );
    headers = { ...this.config.headers, ...headers };

    const { result: res, ms } = await Utils.measure( async () => {
      let res: AxiosResponse< T, any, {} >;
      let retries = 0;

      do {
        res = await this.applyRateLimit( () => this.httpClient[ method ]< T >( url, { headers } ) );
        if ( res.status === 200 && res.data ) break;

        log.warn( `Request failed with status: ${ res.status }. Retrying ...` );
      } while ( ++retries < this.config.rateLimit.retries );

      return { ...res, retries };
    } );

    log.info( `Fetched URL: ${ url } in ${ ms } ms` );

    return Object.assign( { duration: ms, retries: res.retries },
      res.status === 200 && res.data ? { success: true, data: res.data } : {
        success: false, error: `Invalid response status: ${ res.status }`,
        statusCode: res.status
      }
    );
  }
}
