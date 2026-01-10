import { TArgs } from '@/types/generic';

export interface IJob {
    getJobName () : string;
    getArgs () : TArgs;
    isSilent () : boolean;
    isSafeMode () : boolean;
    run ( ...args: any[] ) : void | Promise< void >;
}
