import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import { ISnapshot } from '@/interfaces/snapshot';
import { Parser } from '@/parser/Parser';
import { TSnapshot } from '@rtbnext/schema/src/abstract/generic';

export abstract class Snapshot< T extends TSnapshot > implements ISnapshot< T > {

    protected static readonly storage = Storage.getInstance();
    protected dates: string[];

    protected constructor (
        protected readonly path: string,
        protected readonly ext: 'json' | 'csv' = 'json'
    ) {
        Snapshot.storage.ensurePath( this.path, true );
        this.dates = this.scanDates();
    }

    // Private helpers

    protected scanDates () : string[] {
        return Utils.sort( Snapshot.storage.scanDir( this.path ) );
    }

    // Basic snapshot getters

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

    // Special snapshot getters

    public nearestDate ( dateLike: string ) : string | undefined {
        const target = Parser.date( dateLike )!;
        return this.dates.slice().reduce( ( nearest, date ) => date > target ? nearest : date );
    }

    public datesInRange ( from: string, to: string ) : string[] {
        const fromDate = Parser.date( from )!, toDate = Parser.date( to )!;
        return this.dates.filter( date => date >= fromDate && date <= toDate );
    }

    public firstInYear ( year: string | number ) : string | undefined {
        const target = Parser.string( year );
        return this.dates.find( date => date.substring( 0, 4 ) === target );
    }

    public latestInYear ( year: string | number ) : string | undefined {
        const target = Parser.string( year );
        return this.dates.filter( date => date.substring( 0, 4 ) === target ).at( -1 );
    }

}
