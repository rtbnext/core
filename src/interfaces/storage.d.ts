export interface IStorage {
  readonly root: string;
  exists ( path: string ) : boolean;
  assertPath ( path: string ) : void | never;
  ensurePath ( path: string, isDir: boolean = false ) : void;
  stat ( path: string ) : Stats | false;
  scanDir ( path: string, ext: string[] = [ 'json', 'csv' ] ) : string[];
  readJSON < T extends object > ( path: string ) : T | false;
  writeJSON < T extends object > ( path: string, content: T ) : boolean;
  readCSV< T extends any[] > ( path: string ) : T | false;
  writeCSV< T extends any[] > ( path: string, content: T ) : boolean;
  appendCSV< T extends any[] > ( path: string, content: T, nl: boolean = true ) : boolean;
  datedCSV< T extends any[] > ( path: string, content: T, force: boolean = false ) : boolean;
  remove ( path: string, force: boolean = true ) : boolean;
  move ( from: string, to: string, force: boolean = false ) : boolean;
}
