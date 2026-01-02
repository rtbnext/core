export class Parser {

    // Helper

    public static strict< T = any > (
        value: any, method: keyof typeof Parser, ...args: any
    ) : T | undefined {
        return value === null || value === undefined ? undefined
            : ( Parser as any )[ method ]( value, ...args ) as T;
    }

}
