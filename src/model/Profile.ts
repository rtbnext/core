import { Storage } from '@/core/Storage';
import { IProfile } from '@/interfaces/profile';
import { ProfileIndex } from '@/model/ProfileIndex';

export class Profile implements IProfile {

    private static readonly storage = Storage.getInstance();
    private static readonly index = ProfileIndex.getInstance();

}
