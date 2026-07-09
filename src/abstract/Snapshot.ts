import type { TSnapshot, TSnapshotIndex } from '@rtbnext/schema/src/base/generic';
import { join } from 'node:path';

import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import type { ISnapshot } from '@/interface/snapshot';
import { Parser } from '@/parser/Parser';


export abstract class Snapshot< T extends TSnapshot > implements ISnapshot< T > {
  protected static readonly storage = Storage.getInstance();

  protected readonly path: string
  protected dates: string[];

  protected constructor ( path: string ) {
    this.path = path;
    Snapshot.storage.ensurePath( this.path, true );
    this.dates = this.scanDates();
  }

  // --- helper ---

  protected scanDates () : string[] {
    return Utils.sort(
      Snapshot.storage.scanFiles( this.path, [ 'json' ], [ 'index.json' ] )
        .map( f => f.replace( '.json', '' ) )
    );
  }

  protected datedPath ( date: string ) : string {
    return join( this.path, `${ date }.json` );
  }

  // --- basic getter ---

  public getDates () : string[] {
    return this.dates;
  }

  public hasDate ( dateLike: string ) : boolean {
    return this.dates.includes( Parser.date( dateLike, 'ymd' )! );
  }

  public firstDate () : string | undefined {
    return this.dates[ 0 ];
  }

  public latestDate () : string | undefined {
    return this.dates.at( -1 );
  }

  // --- special getter ---

  public nearestDate ( dateLike: string ) : string | undefined {
    const target = Parser.date( dateLike )!;
    return this.dates.slice().reduce( ( nearest, date ) => date > target ? nearest : date );
  }

  public datesInRange ( from: string, to: string ) : string[] {
    const fromDate = Parser.date( from )!, toDate = Parser.date( to )!;
    return this.dates.filter( date => date >= fromDate && date <= toDate );
  }

  public datesInYear ( year: string | number ) : string[] {
    return this.datesInRange( `${ year }-01-01`, `${ year }-12-31` );
  }

  public firstInYear ( year: string | number ) : string | undefined {
    const target = Parser.string( year );
    return this.dates.find( date => date.substring( 0, 4 ) === target );
  }

  public latestInYear ( year: string | number ) : string | undefined {
    const target = Parser.string( year );
    return this.dates.filter( date => date.substring( 0, 4 ) === target ).at( -1 );
  }

  // --- get snapshot data ---

  public getSnapshot ( dateLike: string, exactMatch: boolean = true ) : T | undefined {
    const target = Parser.date( dateLike )!;
    const date = this.hasDate( target ) ? target : exactMatch ? undefined : this.nearestDate( target );

    if ( date ) return Snapshot.storage.readJSON< T >( this.datedPath( date ) ) || undefined;
  }

  public getLatest () : T | undefined {
    if ( this.dates.length ) return this.getSnapshot( this.dates.at( -1 )! );
  }

  // --- save snapshot ---

  public saveSnapshot ( snapshot: T, force: boolean = false ) : boolean {
    log.debug( `Saving snapshot for date ${ snapshot.date }` );

    return log.catch( () => {
      if ( ! force && this.hasDate( snapshot.date ) )
        throw new Error( `Snapshot for date ${ snapshot.date } already exists` );

      const path = this.datedPath( snapshot.date );
      if ( ! Snapshot.storage.writeJSON< T >( path, snapshot ) )
        throw new Error( `Failed to write snapshot to ${ path }` );

      this.dates = this.scanDates();
      return this.generateIndex();
    }, `Failed to save snapshot for date ${ snapshot.date }` ) ?? false;
  }

  // --- date index ---

  public getIndex () : TSnapshotIndex | undefined {
    return Snapshot.storage.readJSON< TSnapshotIndex >( join( this.path, 'index.json' ) ) || undefined;
  }

  public generateIndex () : boolean {
    log.debug( `Rebuild data index for snapshot data @ ${ this.path } (${ this.dates.length } entries)` );

    return Snapshot.storage.writeJSON< TSnapshotIndex >( join( this.path, 'index.json' ), {
      ...Utils.metaData(), dates: this.dates, latest: this.dates.at( -1 )
    } );
  }
}
