import type { Expand } from 'devtypes/types/util';

import type { IJob } from '@/interface/job';
import type { TQueueType } from '@/type/queue';


export type TJobOption = {
  name: string;
  desc: string;
  parser?: ( value: string ) => any;
  required?: boolean;
};

export type TJobOptions = ReadonlyArray< TJobOption >;

export type TJobCommand = {
  readonly id: string;
  desc: string;
  options: TJobOptions;
};

export type TJobClsOptions< T extends object = {} > = Expand< {
  silent?: boolean;
  safeMode?: boolean;
} & T >;

export type TAnnualJobOptions = TJobClsOptions< {
  year: number;
  profiles?: string[];
} >;

export type TMergeJobOptions = TJobClsOptions< {
  list?: string[];
  source?: string;
  target?: string;
  dryRun?: boolean;
  force?: boolean;
  makeAlias?: boolean;
} >;

export type TMoveJobOptions = TJobClsOptions< {
  source: string;
  target: string;
  makeAlias?: boolean;
} >;

export type TProfileJobOptions = TJobClsOptions< {
  profiles?: string[];
  replace?: boolean;
  skipRanking?: boolean;
  skipWiki?: boolean;
} >;

export type TQueueJobOptions = TJobClsOptions< {
  type: TQueueType;
  add?: string[];
  remove?: string[];
  prio?: number;
  args?: any;
  clear?: boolean;
} >;

export type TTop10JobOptions = TJobClsOptions< {
  date?: readonly [
    year: number,
    month: number
  ];
} >;

export type TWikiJobOptions = TJobClsOptions< {
  profile: string;
  assign?: string;
} >;

export interface TJobCls {
  readonly command: TJobCommand;
  new ( options: TJobClsOptions< any > ) : IJob;
}

export type TJobRegistry = ReadonlyArray< TJobCls >;
