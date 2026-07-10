import type { TService } from '@rtbnext/schema/src/base/const';

import type { TJobClsOptions } from '@/type/job';


export interface IJob< T extends TJobClsOptions = TJobClsOptions > {
  getJobName () : string;
  getJobServices () : TService[];
  getOptions () : T;
  isSilent () : boolean;
  isSafeMode () : boolean;
  run () : void | Promise< void >;
}
