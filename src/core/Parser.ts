export class Parser {

    public static number ( value: any, digits = 0 ) : number {
        return Number( Number( value ).toFixed( digits ) );
    }

    public static string ( value: any ) : string {
        return String( value ).trim();
    }

    public static boolean ( value: any ) : boolean {
        return Boolean( value );
    }

}
