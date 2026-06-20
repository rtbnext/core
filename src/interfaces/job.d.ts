import type { TArgs } from '@/type/generic';


export interface IJob {
  getJobName () : string;
  getArgs () : TArgs;
  isSilent () : boolean;
  isSafeMode () : boolean;
  run () : void | Promise< void >;
}
