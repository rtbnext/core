import { List } from './List';
import { ListIndex } from './ListIndex';
import { Profile } from './Profile';
import { ProfileIndex } from './ProfileIndex';

const collection = {
    profileIndex: ProfileIndex.getInstance,
    listIndex: ListIndex.getInstance
};

export { List, ListIndex, Profile, ProfileIndex };
export default collection;
