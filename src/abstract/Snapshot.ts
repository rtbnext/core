import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';

export abstract class Snapshot {

    protected static readonly storage = Storage.getInstance();
    protected dates: string[];

    protected constructor (
        protected readonly path: string,
        protected readonly ext: 'json' | 'csv' = 'json'
    ) {
        Snapshot.storage.ensurePath( this.path, true );
        this.dates = this.scanDates();
    }

    protected scanDates () : string[] {
        return Utils.sort( Snapshot.storage.scanDir( this.path ) );
    }

}
