import { ProfileJob } from '@/job/Profile';
import type { TJobRegistry } from '@/type/job';


export const JOBS = [ ProfileJob ] as const satisfies TJobRegistry;
