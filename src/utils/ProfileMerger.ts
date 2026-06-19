import { CmpStrAsync } from 'cmpstr';

import { REGEX_URI_CLEANUP } from '@/lib/regex';


CmpStrAsync.filter.add( 'input', 'normalizeUri', ( uri: string ) => uri.replace( REGEX_URI_CLEANUP, '' ) );

export class ProfileMerger {}
