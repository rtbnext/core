import { Storage } from '@/core/Storage';
import type { IImage } from '@/interface/image';
import type { TImageMedia } from '@/type/image';


export class Image implements IImage {
  private static readonly storage = Storage.getInstance();
  private static instance: IImage;
  private static readonly hashLength = 32;

  private readonly media: TImageMedia;

  private constructor () {
    this.media = Image.storage.readJSON< TImageMedia >( 'profile/media.json' ) || {};
  }

  // --- instantiate ---

  public static getInstance () : IImage {
    return Image.instance ??= new Image();
  }
}
