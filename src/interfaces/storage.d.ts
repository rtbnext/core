import type { TStorageScanType } from '@/type/storage';


export interface IStorage {
  readonly root: string;
  exists ( path: string ) : boolean;
  assertPath ( path: string ) : void | never;
  ensurePath ( path: string, isDir?: boolean ) : void;
  stat ( path: string ) : Stats | false;
  scanDir ( path: string, ext?: string[], exclude?: string[], type?: TStorageScanType ) : string[];
  scanFiles ( path: string, ext?: string[], exclude?: string[] ) : string[];
  scanDirs ( path: string, exclude?: string[] ) : string[];
  readJSON < T extends object > ( path: string ) : T | false;
  writeJSON < T extends object > ( path: string, content: T ) : boolean;
  readCSV < T extends any[] > ( path: string ) : T | false;
  writeCSV < T extends any[] > ( path: string, content: T ) : boolean;
  appendCSV < T extends any[] > ( path: string, content: T, nl?: boolean ) : boolean;
  datedCSV < T extends any[] > ( path: string, content: T, force?: boolean ) : boolean;
  remove ( path: string, force?: boolean ) : boolean;
  move ( from: string, to: string, force?: boolean ) : boolean;
}
