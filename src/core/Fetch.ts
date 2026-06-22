import { Config } from '@/core/Config';
import type { IFetch } from '@/interface/fetch';
import type { TFetchConfig } from '@/type/config';
import axios, { type AxiosInstance } from 'axios';


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
}
