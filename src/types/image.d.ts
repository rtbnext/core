interface IImageMedia {
  file: string;
  thumb?: string;
}

type TImageMedia = Record< string, IImageMedia >;
