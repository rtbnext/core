import { type AxiosInstance } from 'axios';

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
  }

  // --- instantiate ---

  public static getInstance () : IFetch {
    return Fetch.instance ||= new Fetch();
  }
}
