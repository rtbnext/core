import { createHash } from 'node:crypto';

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

  // --- helper ---

  private hash ( buffer: Buffer ) : string {
    return createHash( 'sha256' ).update( buffer ).digest( 'hex' ).slice( 0, Image.hashLength );
  }

  private filename ( buffer: Buffer, ext: string ) : string {
    return `${ this.hash( buffer ) }.${ ext.toLowerCase() }`;
  }

  // --- instantiate ---

  public static getInstance () : IImage {
    return Image.instance ??= new Image();
  }
}
