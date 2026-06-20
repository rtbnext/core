import type { IJob } from '@/interface/job';


export type TJobOption = readonly [
  name: string,
  desc: string,
  required?: boolean
];

export type TJobOptions = ReadonlyArray< TJobOption >;

export type TJobDefinition = {
  readonly id: string;
  name: string;
  desc: string;
  options: TJobOptions;
};

export interface TJobClass {
  readonly definition: TJobDefinition;
  new ( args: string[] ) : IJob;
}

export type TJobRegistry = ReadonlyArray< TJobClass >;
