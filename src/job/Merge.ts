import { Job, jobRunner } from '@/abstract/Job';
import { IJob } from '@/interfaces/job';

export class MergeJob extends Job implements IJob {

    constructor ( args: string[] ) {
        super( args, 'Merge' );
    }

    public async run () : Promise< void > {
        await this.protect( async () => {} );
    }

}

jobRunner( MergeJob );
