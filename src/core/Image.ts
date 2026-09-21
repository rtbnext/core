import type { IImage } from '@/interface/image';
import type { TImageMedia } from '@/type/image';


export class Image implements IImage {
  private static instance: IImage;

  private static readonly hashLength = 32;
  private static readonly mediaFile = 'profile/media.json';

  private readonly storage: Storage;
  private media: TImageMedia;

  // --- instantiate ---

  public static getInstance () : IImage {
    return Image.instance ??= new Image();
  }
}
