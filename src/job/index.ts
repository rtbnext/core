import { AliasJob } from '@/job/AliasJob';
import { AnnualJob } from '@/job/AnnualJob';
import { IndexJob } from '@/job/IndexJob';
import { ListJob } from '@/job/ListJob';
import { MergeJob } from '@/job/MergeJob';
import { MoveJob } from '@/job/MoveJob';
import { PerformanceJob } from '@/job/PerformanceJob';
import { ProfileJob } from '@/job/ProfileJob';
import { QueueJob } from '@/job/QueueJob';
import { RebuildJob } from '@/job/RebuildJob';
import { RTBJob } from '@/job/RTBJob';
import { StatsJob } from '@/job/StatsJob';
import { StatusJob } from '@/job/StatusJob';
import { Top10Job } from '@/job/Top10Job';
import { WikiJob } from '@/job/WikiJob';
import type { TJobRegistry } from '@/type/job';


export const JOBS = [
  AliasJob, AnnualJob, IndexJob, ListJob, MergeJob, MoveJob, PerformanceJob, ProfileJob,
  QueueJob, RebuildJob, RTBJob, StatsJob, StatusJob, Top10Job, WikiJob
] as const satisfies TJobRegistry;
