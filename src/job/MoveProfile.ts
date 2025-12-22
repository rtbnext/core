import { Job, jobRunner } from '@/abstract/Job';
import { TArgs } from '@/types/generic';

export class MoveProfile extends Job {

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'MoveProfile' );
    }

    public async run ( args: TArgs ) : Promise< void > {
        await this.protect( async () => {} );
    }

}

jobRunner( MoveProfile );
