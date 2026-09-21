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

  private isUsed ( filename: string ) : boolean {
    return Object.values( this.media ).some( ( { file, thumb } ) => file === filename || thumb === filename );
  }

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
    return log.catch( () => {
      const media: IImageMedia = { file: this.filename( file.buffer, file.filename ) };
      if ( thumb ) media.thumb = this.filename( thumb.buffer, thumb.filename );

      if ( ! this.saveMedia( file.buffer, media.file ) ) return false;
      if ( thumb && media.thumb && ! this.saveMedia( thumb.buffer, media.thumb ) ) return false;

      this.media[ uri ] = media;
      return this.saveIndex();
    }, `Failed to save media for ${ uri }` ) ?? false;
  }

  public remove ( uri: string ) : boolean {
    return log.catch( () => {
      const { file, thumb } = this.get( uri ) ?? {};
      if ( ! file && ! thumb ) return false;

      delete this.media[ uri ];
      if ( ! this.saveIndex() ) return false;

      if ( file && ! this.isUsed( file ) ) Image.storage.removeMedia( file );
      if ( thumb && ! this.isUsed( thumb ) ) Image.storage.removeMedia( thumb );

      return true;
    }, `Failed to remove media for ${ uri }` ) ?? false;
  }

  public clean () : boolean {
    return log.catch( () => {
      const referenced = new Set( Object.values( this.media ).flatMap(
        media => [ media.file, ...( media.thumb ? [ media.thumb ] : [] ) ]
      ) );

      for ( const file of Image.storage.scanMedia( '' ) ) if ( ! referenced.has( file ) )
        Image.storage.removeMedia( file );

      return true;
    }, 'Failed to clean media storage' ) ?? false;
  }

  // --- instantiate ---

  public static getInstance () : IImage {
    return Image.instance ??= new Image();
  }
}
