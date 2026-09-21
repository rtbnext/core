export type IImageMedia = {
  file: string;
  thumb?: string;
};

export type TImageMedia = Record< string, IImageMedia >;

export type TImageProps = {
  buffer: Buffer;
  filename: string;
};
