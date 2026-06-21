import type { IJob } from '@/interface/job';


export type TJobOption = {
  name: string;
  desc: string;
  cb?: ( value: string ) => any;
  required?: boolean;
};

export type TJobOptions = ReadonlyArray< TJobOption >;

export type TJobDefinition = {
  readonly id: string;
  desc: string;
  options: TJobOptions;
};

export interface TJobClass {
  readonly definition: TJobDefinition;
  new ( args: string[] ) : IJob;
}

export type TJobRegistry = ReadonlyArray< TJobClass >;
