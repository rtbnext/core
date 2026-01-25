import { Job, jobRunner } from '@/abstract/Job';
import { IJob } from '@/interfaces/job';

export class MoveJob extends Job implements IJob {

    constructor ( args: string[] ) {
        super( args, 'Move' );
    }

    public async run () : Promise< void > {}

}

jobRunner( MoveJob );
