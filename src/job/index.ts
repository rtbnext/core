import { AnnualJob } from '@/job/Annual';
import { MergeJob } from '@/job/Merge';
import { MoveJob } from '@/job/Move';
import { PerformanceJob } from '@/job/Performance';
import { ProfileJob } from '@/job/Profile';
import { QueueJob } from '@/job/Queue';
import { RTBJob } from '@/job/RTB';
import { StatsJob } from '@/job/Stats';
import { Top10Job } from '@/job/Top10';
import { WikiJob } from '@/job/Wiki';
import type { TJobRegistry } from '@/type/job';


export const JOBS = [
  AnnualJob, MergeJob, MoveJob, PerformanceJob, ProfileJob, QueueJob, RTBJob,
  StatsJob, Top10Job, WikiJob
] as const satisfies TJobRegistry;
