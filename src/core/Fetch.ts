import { Config } from '@/core/Config';
import type { IFetch } from '@/interface/fetch';
import type { TFetchConfig } from '@/type/config';
import { type AxiosInstance } from 'axios';


export class Fetch implements IFetch {
  private static instance: IFetch;

  private readonly config: TFetchConfig;
  private lastRequest: number = 0;
  private httpClient: AxiosInstance;

  private constructor () {
    this.config = Config.getInstance().fetch;
    this.httpClient = this.setupHttpClient();
  }
}
