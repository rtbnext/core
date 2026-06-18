import { parse, stringify } from 'csv-string';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync, type Stats } from 'node:fs';
import { dirname, extname, join } from 'node:path';

import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { Utils } from '@/core/Utils';
import type { IStorage } from '@/interface/storage';
import type { TStorageConfig } from '@/type/config';
import type { TStorageRWType, TStorageWOptions } from '@/type/storage';


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

  private read ( path: string, type?: TStorageRWType ) : unknown {
    return log.catch( () => {
      this.assertPath( path = this.resolvePath( path ) );
      const content = readFileSync( path, 'utf8' );

      switch ( type ?? this.fileExt( path ) ) {
        case 'raw': return content;
        case 'json': return JSON.parse( content );
        case 'csv': return parse( content );
      }

      throw new Error( `Unsupported file extension: ${ extname( path ) }` );
    }, `Failed to read ${ path }` );
  }

  private write (
    path: string, content: any, type?: TStorageRWType,
    options: TStorageWOptions = { append: false, nl: true }
  ) : void {
    log.catch( () => {
      this.ensurePath( path = this.resolvePath( path ) );

      switch ( type ?? this.fileExt( path ) ) {
        case 'csv':
          content = stringify( content ).trim();
          break;
        case 'json':
          content = JSON.stringify( content, null, this.config.compression ? undefined : 2 ).trim();
          break;
      }

      if ( options.nl && ! content.endsWith( '\n' ) ) content += '\n';

      ( options.append ? appendFileSync : writeFileSync )( path, content, 'utf8' );
      log.debug( `Wrote data to ${ path }`, options );
    }, `Failed to write ${ path }` );
  }

  // --- path operations ---

  public get root () : string {
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

  public stat ( path: string ) : Stats | false {
    return log.catch( () => {
      this.assertPath( path = this.resolvePath( path ) );
      return statSync( path );
    }, `Failed to stat ${ path }` ) ?? false;
  }

  // --- scan dir ---

  public scanDir ( path: string, ext: string[] = [ 'json', 'csv' ] ) : string[] {
    return log.catch( () => {
      this.assertPath( path = this.resolvePath( path ) );
      return readdirSync( path ).filter( f => ext.includes( this.fileExt( f ) ) );
    }, `Failed to scan ${ path }` ) ?? [];
  }

  // --- JSON files ---

  public readJSON < T > ( path: string ) : T | false {
    try { return this.read( path, 'json' ) as T }
    catch { return false }
  }

  public writeJSON < T > ( path: string, content: T ) : boolean {
    try { this.write( path, Utils.sortKeysDeep( content ), 'json' ); return true }
    catch { return false }
  }

  // --- instantiate ---

  public static getInstance () : IStorage {
    return Storage.instance ||= new Storage();
  }
}
