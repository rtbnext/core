export interface Storage {
    public exists ( path: string ) : boolean;
    public assertPath ( path: string ) : void | never;
    public ensurePath ( path: string, isDir: boolean = false ) : void;
    public scanDir ( path: string, ext: string[] = [ 'json', 'csv' ] ) : string[];
    public readJSON< T > ( path: string ) : T | false;
    public writeJSON< T > ( path: string, content: T ) : boolean;
    public readCSV< T extends any[] > ( path: string ) : T | false;
    public writeCSV< T extends any[] > ( path: string, content: T ) : boolean;
    public appendCSV< T extends any[] > ( path: string, content: T, nl: boolean = true ) : boolean;
    public datedCSV< T extends any[] > ( path: string, content: T, force: boolean = false ) : boolean;
    public move ( from: string, to: string, force: boolean = false ) : boolean;
    public remove ( path: string, force: boolean = true ) : boolean;
    public initDB () : void;
}
