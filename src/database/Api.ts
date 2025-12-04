export class Database {

    private static instance: Database;

    protected constructor () {}

    public static getInstance () : Database {

        if ( ! Database.instance ) Database.instance = new Database();
        return Database.instance;

    }

    public static sanitize< T extends string = string > ( value: any ) : T {

        return String( value ).toLowerCase().trim() as T;

    }

}
