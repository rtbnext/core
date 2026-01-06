import { Snapshot } from '@/abstract/Snapshot';
import { ISnapshot } from '@/interfaces/snapshot';
import { TMover } from '@rtbnext/schema/src/model/mover';

export class Mover extends Snapshot< TMover > implements ISnapshot< TMover > {

    private static instance: Mover;

    private constructor () {
        super( 'mover', 'json' );
    }

    public static getInstance () : Mover {
        return this.instance ||= new Mover();
    }

}
