import { Profile } from '@/model/Profile';

export class Annual {
  public static generateOne ( uriLike: string ) {
    const profile = Profile.get( uriLike );
    if ( ! profile ) return false;

    const history = profile.getHistory();
    const annual = profile.getData().annual ?? [];
  }

  public static generateAll () {}
}