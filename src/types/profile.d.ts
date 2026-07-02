import type { IProfile } from '@/interface/profile';


export type TProfileOperation = 'create' | 'update' | 'move';

export type TProfileUpdateMode = 'setData' | 'updateData' | 'createOnly';

export type TProfileLookupResult = {
  profile: IProfile | false;
  isExisting: boolean;
  isSimilar: boolean;
};

export type TProfileProcessResult = {
  profile: IProfile | false;
  action: TProfileOperation;
  success: boolean;
};
