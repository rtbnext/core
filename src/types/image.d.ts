export interface IImageMedia {
  file: string;
  thumb?: string;
}

export type TImageMedia = Record< string, IImageMedia >;
