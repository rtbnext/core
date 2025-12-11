export class Logger {

    private static instance: Logger;

    private constructor () {}

    private format () {}

    private log () {}

    public error () {}

    public exit () {}

    public warn () {}

    public info () {}

    public debug () {}

    public static getInstance () : Logger {
        return Logger.instance ||= new Logger();
    }

}
