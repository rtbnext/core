import type { TJobClsOptions } from '@/type/job';


export interface IJob< T extends TJobClsOptions = TJobClsOptions > {
  getJobName () : string;
  getOptions () : T;
  isSilent () : boolean;
  isSafeMode () : boolean;
  run () : void | Promise< void >;
}
