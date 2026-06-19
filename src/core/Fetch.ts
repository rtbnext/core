import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';

import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { Utils } from '@/core/Utils';
import type { IFetch } from '@/interface/fetch';
import { REGEX_NONUM, REGEX_SPACES } from '@/lib/regex';
import { Parser } from '@/parser/Parser';
import type { TFetchConfig } from '@/type/config';
import type { TFetchMethod } from '@/type/fetch';
import type { TListResponse, TProfileResponse, TResponse, TWaybackResponse } from '@/type/response';


export class Fetch implements IFetch {
  private static instance: IFetch;

  private readonly config: TFetchConfig;
  private readonly wikiQuery = { format: 'json', formatversion: 2 };
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

  private getRandomUserAgent () : string {
    return this.config.agentPool[ Math.floor( Math.random() * this.config.agentPool.length ) ];
  }

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

  // --- helper ---

  private prepQuery ( url: string, replacements: Record< string, unknown > ) : string {
    return Object.entries( replacements ).reduce( ( acc, [ key, value ] ) => {
      return acc.replaceAll( `{${ key.toUpperCase() }}`, String( value ) );
    }, url );
  }

  private async fetch < T > ( url: string, method: TFetchMethod = 'get' ) : Promise< TResponse< T > > {
    log.debug( `Fetching URL: ${ url } via ${ method.toUpperCase() }` );

    const { result: res, ms } = await Utils.measure( async () => {
      let res: AxiosResponse< T, any, {} >;
      let retries = 0;

      do {
        const headers = { ...this.config.headers, 'User-Agent': this.getRandomUserAgent() };
        res = await this.applyRateLimit( () => this.httpClient[ method ]< T >( url, { headers } ) );
        if ( res.status === 200 && res.data ) break;

        log.warn( `Request failed with status: ${ res.status }. Retrying ...` );
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

  private retErr ( res: TResponse< unknown >, msg?: string, code?: number ) : TResponse< never > {
    return {
      success: false, statusCode: code ?? res.statusCode ?? 500, error: msg ?? res.error,
      duration: res.duration, retries: res.retries
    };
  }

  // --- fetch methods ---

  public async single < T > ( url: string, method: TFetchMethod = 'get' ) : Promise< TResponse< T > > {
    return this.fetch< T >( url, method );
  }

  public async batch < T > ( urls: string[], method: TFetchMethod = 'get' ) : Promise< TResponse< T >[] > {
    const results: TResponse< T >[] = [];
    let url;

    while ( ( url = urls.shift() ) && results.length < this.config.rateLimit.batchSize )
      results.push( await this.fetch< T >( url, method ) );

    if ( urls.length ) log.warn( `Batch limit reached: ${ urls.length } URLs remaining` );
    return results;
  }

  // --- special requests ---

  public async wayback < T > ( url: string, ts: unknown ) : Promise< TResponse< T > > {
    const res = await this.single< TWaybackResponse >( this.prepQuery( this.config.endpoints.wayback, {
      url: encodeURIComponent( url ), ts: Parser.date( ts, 'ymd' )!.replaceAll( REGEX_NONUM, '' )
    } ) );

    if ( ! res?.success || ! res.data?.archived_snapshots?.closest?.available )
      return this.retErr( res, 'No archived snapshot found', 404 );

    return this.single< T >( res.data.archived_snapshots.closest.url.replace( '/http', 'if_/http' ) );
  }

  public async list < T extends object > ( uriLike: string, year: string ) : Promise< TResponse< TListResponse< T > > > {
    const { requests: { list: { chunkSize, maxRequests } } } = this.config;
    const uri = Utils.sanitize( uriLike ), entries: T[] = [];
    let res: TResponse< TListResponse< T > >, count = 0, start = 0, requests = 0;

    do {
      res = await this.single< TListResponse< T > >( this.prepQuery(
        this.config.endpoints.list, { uri, year, limit: chunkSize, start }
      ) );

      if ( ! res.success ) return this.retErr( res );
      if ( ! res.data?.personList.count ) return this.retErr( res, 'Could not fetch list data', 404 );

      entries.push( ...res.data.personList.personsLists );
      count = res.data.personList.count, start += chunkSize;
    } while ( ++requests < maxRequests && start < count );

    res.data.personList.personsLists = entries;
    return res;
  }

  public async profile ( ...uriLike: string[] ) : Promise< TResponse< TProfileResponse >[] > {
    return this.batch< TProfileResponse >( uriLike.map( uri =>
      this.prepQuery( this.config.endpoints.profile, { uri: Utils.sanitize( uri ) } )
    ) );
  }

  public async wikidata < T > ( sparql: string ) : Promise< TResponse< T > > {
    return this.single< T >( this.prepQuery( this.config.endpoints.wikidata, {
      sparql: encodeURIComponent( sparql.replace( REGEX_SPACES, ' ' ).trim() )
    } ) );
  }

  public async wikipedia < T > ( query: Record< string, unknown >, lang: string = 'en' ) : Promise< TResponse< T > > {
    return this.single< T >( this.prepQuery( this.config.endpoints.wikipedia, {
      query: Utils.queryStr( { ...this.wikiQuery, ...query } ), lang
    } ) );
  }

  public async commons < T > ( query: Record< string, unknown > ) : Promise< TResponse< T > > {
    return this.single< T >( this.prepQuery( this.config.endpoints.commons, {
      query: Utils.queryStr( { ...this.wikiQuery, ...query } )
    } ) );
  }

  // --- instantiate ---

  public static getInstance () : IFetch {
    return Fetch.instance ??= new Fetch();
  }
}
