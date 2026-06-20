export type TCommandOption = readonly [
  name: string,
  desc: string,
  required?: boolean
];

export type TCommandOptions = ReadonlyArray< TCommandOption >;

export type TCommandDefinition = {
  readonly id: string;
  name: string;
  desc: string;
  options: TCommandOptions;
};
