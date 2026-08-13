import { ArrayMode } from '@komed3/deepmerge';
import type { TProfileData, TProfileInfo } from '@rtbnext/schema/src/model/profile';
import { CmpStrAsync, type CmpStrResult } from 'cmpstr';

import { REGEX_URI_CLEANUP } from '@/lib/regex';
import { ProfileIndex } from '@/model/ProfileIndex';

CmpStrAsync.filter.add( 'input', 'normalizeUri', ( uri: string ) => uri.replace( REGEX_URI_CLEANUP, '' ) );

export class ProfileMerger {
  private static readonly cmp = CmpStrAsync.create( { metric: 'dice', safeEmpty: true } );
  private static readonly index = ProfileIndex.getInstance();
}
