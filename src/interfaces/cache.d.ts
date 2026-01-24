export interface ICache< T = any > {
    public size () : number;
    get< T = any > ( key: string ) : T | undefined;
    has ( key: string ) : boolean;
    clear () : void;
}
