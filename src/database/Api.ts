import { ProfileCollection } from '@rtbnext/schema/src/collection/profile';
import { Storage } from '../core/Storage';

export class Database {

    private static instance: Database;
    private storage: Storage;

    public profileIndex: ProfileCollection[ 'index' ];
    public profileAlias: ProfileCollection[ 'alias' ];

    protected constructor () {

        this.storage = Storage.getInstance();

        this.profileIndex = this.storage.loadJson< ProfileCollection[ 'index' ] >( 'profile/_index' ) ?? {};
        this.profileAlias = this.storage.loadJson< ProfileCollection[ 'alias' ] >( 'profile/_alias' ) ?? {};

    }

    public static getInstance () : Database {

        if ( ! Database.instance ) Database.instance = new Database();
        return Database.instance;

    }

    public static sanitize< T extends string = string > ( value: any ) : T {

        return String( value ).toLowerCase().trim() as T;

    }

}
