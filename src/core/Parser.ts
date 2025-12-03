export class Parser {

    private static instance: Parser;

    private constructor () {}

    public static getInstance () : Parser {

        if ( ! Parser.instance ) Parser.instance = new Parser();
        return Parser.instance;

    }

}
