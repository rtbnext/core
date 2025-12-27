import { Storage } from '@/core/Storage';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';

export abstract class Dated {

    protected readonly storage: Storage;
    private readonly path: string;
    private dates: string[];

    constructor ( path: string ) {
        this.storage = Storage.getInstance();
        this.path = path;
        this.storage.ensurePath( this.path );
        this.dates = this.scanDates();
    }

    private scanDates () : string[] {
        return Utils.sort( this.storage.scanDir( this.path ) );
    }

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

    public nearestDate ( dateLike: string ) : string | undefined {
        const target = Parser.date( dateLike )!;
        return this.dates.slice().reduce(
            ( nearest, date ) => date > target ? nearest : date
        );
    }

    public datesInRange ( from: string, to: string ) : string[] {
        const fromDate = Parser.date( from )!;
        const toDate = Parser.date( to )!;
        return this.dates.filter( date => date >= fromDate && date <= toDate );
    }

    public latestInYear ( year: string | number ) : string | undefined {
        const target = Parser.string( year );
        return this.dates.filter( date => date.substring( 0, 4 ) === target ).at( -1 );
    }

}
