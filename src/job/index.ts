import { MoveJob } from '@/job/Move';
import { ProfileJob } from '@/job/Profile';
import { WikiJob } from '@/job/Wiki';
import type { TJobRegistry } from '@/type/job';


export const JOBS = [
  MoveJob, ProfileJob, WikiJob
] as const satisfies TJobRegistry;
