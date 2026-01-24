import { REGEX_URI_CLEANUP } from '@/core/RegEx';
import { CmpStrAsync } from 'cmpstr';

CmpStrAsync.filter.add( 'input', 'normalizeUri', ( uri: string ) : string =>
    uri.replace( REGEX_URI_CLEANUP, '' )
);

export class ProfileMerger {

    // Prevent instantiation

    private constructor () {}

}
