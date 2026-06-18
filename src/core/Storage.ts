import { existsSync, mkdirSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';

import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import type { IStorage } from '@/interface/storage';
import type { TStorageConfig } from '@/type/config';


export class Storage implements IStorage {
  private static instance: Storage;

  private readonly config: TStorageConfig;
  private readonly path: string;

   private constructor () {
    const { root, storage } = Config.getInstance();
    this.config = storage;
    this.path = join( root, this.config.baseDir );

    this.initDB();
  }

  private initDB () : void {
    log.debug( `Initializing storage at "${ this.path }"` );
    this.ensurePath( this.path );

    [ 'profile', 'list', 'filter', 'mover', 'stats', 'queue' ]
      .forEach( path => this.ensurePath( path, true ) );
  }

  // --- helper ---

  private resolvePath ( path: string ) : string {
    return path.includes( this.path ) ? path : join( this.path, path );
  }

  private fileExt ( path: string ) : string {
    return extname( this.resolvePath( path ) ).toLowerCase().slice( 1 );
  }

  // --- path operations ---

  public getRoot () : string {
    return this.path;
  }

  public exists ( path: string ) : boolean {
    return existsSync( this.resolvePath( path ) );
  }

  public assertPath ( path: string ) : void | never {
    if ( ! this.exists( path ) ) throw new Error( `Path ${ path } does not exist` );
  }

  public ensurePath ( path: string, isDir: boolean = false ) : void {
    path = this.resolvePath( path );
    mkdirSync( isDir ? path : dirname( path ), { recursive: true } );
  }

  // --- instantiate ---

  public static getInstance () : IStorage {
    return Storage.instance ||= new Storage();
  }
}
