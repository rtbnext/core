import { MergeJob } from '@/job/Merge';
import { MoveJob } from '@/job/Move';
import { ProfileJob } from '@/job/Profile';
import { QueueJob } from '@/job/Queue';
import { WikiJob } from '@/job/Wiki';
import type { TJobRegistry } from '@/type/job';


export const JOBS = [
  MergeJob, MoveJob, ProfileJob, QueueJob, WikiJob
] as const satisfies TJobRegistry;
