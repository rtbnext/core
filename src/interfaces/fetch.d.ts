import type { TFetchMethod, THeader } from '@/type/fetch';
import type { TListResponse, TProfileResponse, TResponse } from '@/type/response';


export interface IFetch {
  single < T > ( url: string, method: TFetchMethod = 'get', header?: THeader ) : Promise< TResponse< T > >;
  batch < T > ( urls: string[], method: TFetchMethod = 'get', header?: THeader ) : Promise< TResponse< T >[] >;
  wayback < T > ( url: string, ts: unknown ) : Promise< TResponse< T > >;
  list < T extends object > ( uriLike: string, year: string ) : Promise< TResponse< TListResponse< T > > >;
  profile ( ...uriLike: string[] ) : Promise< TResponse< TProfileResponse >[] >;
  wikidata < T > ( sparql: string ) : Promise< TResponse< T > >;
  wikipedia < T > ( query: Record< string, unknown >, lang: string = 'en' ) : Promise< TResponse< T > >;
  commons < T > ( query: Record< string, unknown > ) : Promise< TResponse< T > >;
}
