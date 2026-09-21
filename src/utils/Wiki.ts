import { Fetch } from '@/core/Fetch';
import { Image } from '@/core/Image';


export class Wiki {
  private static readonly fetch = Fetch.getInstance();
  private static readonly image = Image.getInstance();
}
