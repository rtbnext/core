import type { IProfile } from '@/interface/profile';


export type TProfileOperation = 'create' | 'update' | 'move';

export type TProfileLookupResult = {
  profile: IProfile | false;
  isExisting: boolean;
  isSimilar: boolean;
};
