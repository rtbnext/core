export class Parser {

    public static number ( value: any, digits = 0 ) : number {

        return Number( ( Number( value ) ).toFixed( digits ) );

    }

}
