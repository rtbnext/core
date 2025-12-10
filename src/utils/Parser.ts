export class Parser {

    public static string ( value: any ) : string {
        return String( value ).trim();
    }

    public static boolean ( value: any ) : boolean {
        const truthyValues = [ '1', 'true', 'yes', 'y' ];
        return value !== null && value !== undefined && (
            typeof value === 'boolean' ? value : truthyValues.includes(
                this.string( value ).toLowerCase()
            )
        );
    }

}
