import { CmpStrAsync } from 'cmpstr';

import { REGEX_URI_CLEANUP } from '@/core/RegEx';

CmpStrAsync.filter.add( 'input', 'normalizeUri', ( uri: string ) : string =>
    uri.replace( REGEX_URI_CLEANUP, '' )
);

export class ProfileMerger {

    // Prevent instantiation

    private constructor () {}

}
