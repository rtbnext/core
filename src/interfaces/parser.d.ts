import { ProfileParser } from '@/parser/ProfileParser';

export interface IProfileParser {
    uri () : string;
    id () : string;
    aliases () : string[];
    name () : ReturnType< typeof ProfileParser.name >;
}
