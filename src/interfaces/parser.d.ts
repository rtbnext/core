import { TParsedProfileName } from '@/types/parser';

export interface IProfileParser {
    uri () : string;
    id () : string;
    aliases () : string[];
    name () : TParsedProfileName;
}
