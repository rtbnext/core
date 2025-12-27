import { Storage } from '@/core/Storage';
import { Utils } from '@/utils/Utils';

export class Mover {

    private static instance: Mover;
    private readonly storage: Storage;
    private dates: string[];

    private constructor () {
        this.storage = Storage.getInstance();
        this.storage.ensurePath( 'movers', true );
        this.dates = Utils.sort( this.storage.scanDir( 'movers' ) );
    }

    public static getInstance () : Mover {
        return this.instance ||= new Mover();
    }

}
