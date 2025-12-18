import { Job, jobRunner } from '@/abstract/Job';

export class FetchProfile extends Job {

    public async run () : Promise< void > {
        const batch = this.queue.next( 'profile', this.config.fetch.rateLimit.maxBatchSize );
        const res = this.fetch.profile( ...batch.map( i => i.uri ) );
    }

}

jobRunner( FetchProfile );
