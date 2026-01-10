import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { ListQueue, ProfileQueue } from '@/core/Queue';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import { IJob } from '@/interfaces/job';
import { TArgs } from '@/types/generic';

export abstract class Job implements IJob {

    protected static readonly config = Config.getInstance();
    protected static readonly storage = Storage.getInstance();
    protected static readonly profileQueue = ProfileQueue.getInstance();
    protected static readonly listQueue = ListQueue.getInstance();

    protected readonly job: string;
    protected readonly args: TArgs = {};

    constructor ( job: string ) {
        this.job = job;
        this.args = Utils.parseArgs( process.argv.slice( 2 ) );
        log.info( `Run job: ${job}`, this.args );
    }

}
