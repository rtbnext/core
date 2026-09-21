import type { IImage } from '@/interface/image';


export class Image implements IImage {
  private static instance: IImage;

  // --- instantiate ---

  public static getInstance () : IImage {
    return Image.instance ??= new Image();
  }
}
