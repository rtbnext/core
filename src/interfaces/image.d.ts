import type { IImageMedia, TImageProps } from '@/type/image';


export interface IImage {
  get ( uri: string ) : IImageMedia | undefined;
  save ( uri: string, file: TImageProps, thumb?: TImageProps ) : boolean;
  remove ( uri: string ) : boolean;
  clean () : boolean;
}
