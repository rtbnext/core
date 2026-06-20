import type { IJob } from '@/interface/job';


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

export type TCommands = { [ key: string ]: IJob };
