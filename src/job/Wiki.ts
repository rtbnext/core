import { Job, jobRunner } from '@/abstract/Job';
import { IJob } from '@/interfaces/job';

export class WikiJob extends Job implements IJob {

    constructor ( args: string[] ) {
        super( args, 'Wiki' );
    }

    public async run () : Promise< void > {}

}

jobRunner( WikiJob );
