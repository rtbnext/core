import { Job, jobRunner } from '@/abstract/Job';
import { TArgs } from '@/types/generic';

export class UpdateWiki extends Job {

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'UpdateWiki' );
    }

    public async run ( args: TArgs ) : Promise< void > {}

}

jobRunner( UpdateWiki );
