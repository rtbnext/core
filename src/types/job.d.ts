import type { Expand } from 'devtypes/types/util';

import type { IJob } from '@/interface/job';
import type { TQueueType } from '@/type/queue';


export type TJobClsOptions< T extends object = {} > = Expand< {
  silent?: boolean;
  safeMode?: boolean;
} & T >;

export type TAliasJobOptions = TJobClsOptions< {
  removeGlobal?: string[];
  profile?: string;
  add?: string[];
  remove?: string[];
} >;

export type TAnnualJobOptions = TJobClsOptions< {
  year: number;
  profiles?: string[];
} >;

export type TIndexJobOptions = TJobClsOptions< {
  targets?: ( 'all' | 'filter' | 'mover' | 'list' )[];
} >;

export type TListJobOptions = TJobClsOptions< {
  override?: boolean;
  profileUpdate?: boolean;
  list?: string;
  year?: string;
  name?: string;
  desc?: string;
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

export type TOutdatedJobOptions = TJobClsOptions< {
  date?: string;
  prio?: number;
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

export type TRebuildJobOptions = TJobClsOptions< {
  profiles?: string[];
} >;

export type TStatusJobOptions = TJobClsOptions< {
  cleanup?: boolean;
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

export type TJobOption = {
  name: string;
  desc: string;
  parser?: ( value: string ) => any;
  required?: boolean;
};

export type TJobOptions = ReadonlyArray< TJobOption >;

export type TCommandJob = {
  readonly id: string;
  desc: string;
  options?: TJobOptions;
};

export type TCronJob< T extends object = {} > = ReadonlyArray< {
  cronexpr: string;
  options?: ( date: Date ) => T;
} >;

export interface TJobCls< T extends TJobClsOptions = TJobClsOptions > {
  readonly command: TCommandJob;
  readonly cron?: TCronJob< T >;
  new ( options: T ) : IJob;
}

export type TJobRegistry = ReadonlyArray< TJobCls< any > >;

export type TScheduledJob = {
  JobClass: TJobCls< any >;
  date: Date;
  options: TJobClsOptions< any >;
};
