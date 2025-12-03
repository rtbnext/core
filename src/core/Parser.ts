import { ISOCountryCode } from '@rtbnext/schema/src/abstract/const';
import { getAlpha2Code } from 'i18n-iso-countries';

export class Parser {

    public static boolean ( value: any ) : boolean { return Boolean( value ) }
    public static number ( value: any, d = 0 ) : number { return Number( Number( value ).toFixed( d ) ) }
    public static string ( value: any ) : string { return String( value ).trim() }

    public static country2ISOCode ( country: string ) : ISOCountryCode | undefined {

        const code = getAlpha2Code( country, 'en' );
        if ( code ) return code.toLowerCase() as ISOCountryCode;

    }

}
