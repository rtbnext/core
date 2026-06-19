import type { Profile } from '@/model/Profile';


export type TProfileOperation = 'create' | 'update' | 'merge';

export type TProfileLookupResult = {
  profile: Profile | false;
  isExisting: boolean;
  isSimilar: boolean;
};
