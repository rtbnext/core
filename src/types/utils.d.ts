import { Profile } from '@/model/Profile';

export type TProfileOperation = 'create' | 'update' | 'merge';

export interface TProfileLookupResult {
    profile: Profile | null;
    isExisting: boolean;
    isSimilar: boolean;
}
