import { Storage } from '@/core/Storage';

export class Mover {

    private static instance: Mover;
    private readonly storage: Storage;

    private constructor () {
        this.storage = Storage.getInstance();
    }

    public static getInstance () : Mover {
        return this.instance ||= new Mover();
    }

}
