export interface ICache< K extends string, T = unknown > {
  readonly size: number;
  get ( key: K ) : T | undefined;
  has ( key: K ) : boolean;
  clear () : void;
}
