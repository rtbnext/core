import { Storage } from '@/core/Storage';
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

}
