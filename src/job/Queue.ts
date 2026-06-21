import { Job } from '@/abstract/Job';
import type { TQueueJobOptions } from '@/type/job';


export class QueueJob extends Job< TQueueJobOptions > {}
