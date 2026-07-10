import { parse, stringify } from 'csv-string';
import type { Stats } from 'node:fs';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';

import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { Utils } from '@/core/Utils';
import type { IStorage } from '@/interface/storage';
import type { TStorageConfig } from '@/type/config';
import type { TStorageRWType, TStorageScanType, TStorageWOptions } from '@/type/storage';


export class Storage implements IStorage {
  private static instance: IStorage;

  private readonly config: TStorageConfig;
  private readonly path: string;

   private constructor () {
    const { root, storage } = Config.getInstance();
    this.config = storage;
    this.path = join( root, this.config.baseDir );

    this.initDB();
  }

  private initDB () : void {
    log.debug( `Initializing storage at ${ this.path }` );
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

  private read < T = unknown > ( path: string, type?: TStorageRWType ) : T | false {
    return log.catch( () => {
      this.assertPath( path = this.resolvePath( path ) );
      const content = readFileSync( path, 'utf8' );

      switch ( type ?? this.fileExt( path ) ) {
        case 'raw': return content as T;
        case 'json': return JSON.parse( content ) as T;
        case 'jsonl': return content.split( '\n' ).filter( line => line.trim() ).map( line => JSON.parse( line ) ) as T;
        case 'csv': return parse( content ) as T;
      }

      throw new Error( `Unsupported file extension: ${ extname( path ) }` );
    }, `Failed to read ${ path }` ) ?? false;
  }

  private write (
    path: string, content: any, type?: TStorageRWType,
    options: TStorageWOptions = { append: false, nl: true }
  ) : boolean {
    return log.catch( () => {
      this.ensurePath( path = this.resolvePath( path ) );

      switch ( type ?? this.fileExt( path ) ) {
        case 'raw': content = String( content ); break;
        case 'json': content = JSON.stringify( content, null, this.config.compression ? undefined : 2 ).trim(); break;
        case 'jsonl': content = content.map( ( c: any ) => JSON.stringify( c ) ).join( '\n' ).trim(); break;
        case 'csv': content = stringify( content ).trim(); break;
        default: throw new Error( `Unsupported file extension: ${ extname( path ) }` );
      }

      if ( options.nl && ! content.endsWith( '\n' ) ) content += '\n';
      ( options.append ? appendFileSync : writeFileSync )( path, content, 'utf8' );
      log.debug( `Wrote data to ${ path }`, options );
      return true;
    }, `Failed to write ${ path }` ) ?? false;
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

  public scanDir ( path: string, ext: string[] = [ 'json', 'csv' ], exclude?: string[], type: TStorageScanType = 'files' ) : string[] {
    return log.catch( () => {
      this.assertPath( path = this.resolvePath( path ) );

      return readdirSync( path, { withFileTypes: true } ).filter( entry => {
        const name = entry.name;

        if ( exclude?.includes( name ) ) return false;
        if ( type === 'dirs' ) return entry.isDirectory();
        if ( type === 'files' ) return entry.isFile() && ext.includes( extname( name ).slice( 1 ).toLowerCase() );

        return true;
      } ).map( entry => entry.name );
    }, `Failed to scan ${ path }` ) ?? [];
  }

  public scanFiles ( path: string, ext: string[] = [ 'json', 'csv' ], exclude?: string[] ) : string[] {
    return this.scanDir( path, ext, exclude, 'files' );
  }

  public scanDirs ( path: string, exclude?: string[] ) : string[] {
    return this.scanDir( path, [], exclude, 'dirs' );
  }

  // --- JSON files ---

  public readJSON < T extends object > ( path: string ) : T | false {
    return this.read< T >( path, 'json' );
  }

  public writeJSON < T extends object > ( path: string, content: T ) : boolean {
    return this.write( path, Utils.sortKeysDeep( content ), 'json' );
  }

  // --- CSV files ---

  public readCSV < T extends any[] > ( path: string ) : T | false {
    return this.read< T >( path, 'csv' );
  }

  public writeCSV < T extends any[] > ( path: string, content: T ) : boolean {
    return this.write( path, content, 'csv' );
  }

  public appendCSV < T extends any[] > ( path: string, content: T, nl: boolean = true ) : boolean {
    return this.write( path, content, 'csv', { append: true, nl } );
  }

  public datedCSV < T extends any[] > ( path: string, content: T, force: boolean = false ) : boolean {
    const raw = this.readCSV< T >( path ) || [];
    const filtered = raw.filter( r => r[ 0 ] !== content[ 0 ] );

    if ( ! force && raw.length !== filtered.length ) return false;
    return this.writeCSV< T >( path, [ ...filtered, content ].sort(
      ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] )
    ) as T );
  }

  // --- file operations ---

  public remove ( path: string, force: boolean = true ) : boolean {
    return log.catch( () => {
      this.assertPath( path = this.resolvePath( path ) );

      rmSync( path, { recursive: true, force } );
      log.debug( `Removed ${ path }` );
      return true;
    }, `Failed to remove ${ path }` ) ?? false;
  }

  public move ( from: string, to: string, force: boolean = false ) : boolean {
    return log.catch( () => {
      this.assertPath( from = this.resolvePath( from ) );

      if ( this.exists( to = this.resolvePath( to ) ) ) {
        if ( force ) this.remove( to, true );
        else throw new Error( `Destination path ${ to } already exists` );
      }

      renameSync( from, to );
      log.debug( `Moved ${ from } to ${ to }` );
      return true;
    }, `Failed to move ${ from } to ${ to }` ) ?? false;
  }

  // --- instantiate ---

  public static getInstance () : IStorage {
    return Storage.instance ??= new Storage();
  }
}
