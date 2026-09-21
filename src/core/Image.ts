import { createHash } from 'node:crypto';
import { extname } from 'node:path';

import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import type { IImage } from '@/interface/image';
import type { IImageMedia, TImageMedia, TImageProps } from '@/type/image';


export class Image implements IImage {
  private static readonly storage = Storage.getInstance();
  private static readonly hashLength = 32;
  private static readonly mediaFile = 'profile/media.json';
  private static instance: IImage;

  private readonly media: TImageMedia;

  private constructor () {
    this.media = Image.storage.readJSON< TImageMedia >( Image.mediaFile ) || {};
  }

  // --- helper ---

  private hash ( buffer: Buffer ) : string {
    return createHash( 'sha256' ).update( buffer ).digest( 'hex' ).slice( 0, Image.hashLength );
  }

  private filename ( buffer: Buffer, name: string ) : string {
    return `${ this.hash( buffer ) }${ extname( name ).toLowerCase() }`;
  }

  private saveMedia ( buffer: Buffer, filename: string ) : boolean {
    return Image.storage.mediaExists( filename ) || Image.storage.writeMedia( filename, buffer );
  }

  private saveIndex () : boolean {
    return Image.storage.writeJSON( Image.mediaFile, this.media );
  }

  // --- media ---

  public get ( uri: string ) : IImageMedia | undefined {
    return this.media[ uri ];
  }

  public save ( uri: string, file: TImageProps, thumb?: TImageProps ) : boolean {
    return false;
  }

  public remove ( uri: string ) : boolean {
    return log.catch( () => {
      const { file, thumb } = this.get( uri ) ?? {};
      if ( ! file && ! thumb ) return false;

      file && Image.storage.removeMedia( file );
      thumb && Image.storage.removeMedia( thumb );

      delete this.media[ uri ];
      return this.saveIndex();
    }, `Failed to remove media for ${ uri }` ) ?? false;
  }

  public clean () : boolean {
    return false;
  }

  // --- instantiate ---

  public static getInstance () : IImage {
    return Image.instance ??= new Image();
  }
}
