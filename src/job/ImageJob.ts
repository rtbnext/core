import { Job } from '@/abstract/Job';
import type { TImageJobOptions } from '@/type/job';


export class ImageJob extends Job< TImageJobOptions > {
  constructor ( options: TImageJobOptions ) { super( options, 'image', [ 'system' ] ) }
}
