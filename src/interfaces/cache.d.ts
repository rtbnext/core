export interface ICache {
  readonly size: number;
  get < T = any > ( key: string ) : T | undefined;
  has ( key: string ) : boolean;
  clear () : void;
}
