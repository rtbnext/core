import { IJob } from '@/interfaces/job';

export type TJobNames = 'queue' | 'stats' | 'wiki';

export type TJobCtor = new ( ...args: any[] ) => IJob;

export type TJobs = Record< TJobNames, TJobCtor >;
