import type { Expand } from 'devtypes/types/util';

import type { IJob } from '@/interface/job';


export type TJobOption = {
  name: string;
  desc: string;
  parser?: ( value: string ) => any;
  required?: boolean;
};

export type TJobOptions = ReadonlyArray< TJobOption >;

export type TJobDefinition = {
  readonly id: string;
  desc: string;
  options: TJobOptions;
};

export type TJobClsOptions< T extends object = {} > = Expand< {
  silent?: boolean;
  safeMode?: boolean;
} & T >;

export type TProfileJobOptions = TJobClsOptions< {
  profiles?: string[];
  replace?: boolean;
  skipRanking?: boolean;
  skipWiki?: boolean;
} >;

export type TWikiJobOptions = TJobClsOptions< {
  profile: string;
  assign?: string;
} >;

export interface TJobCls {
  readonly definition: TJobDefinition;
  new ( options: TJobClsOptions ) : IJob;
}

export type TJobRegistry = ReadonlyArray< TJobCls >;
