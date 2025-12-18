import { Job, jobRunner } from '@/abstract/Job';

export class FetchProfile extends Job {

    public async run () : Promise< void > {}

}

jobRunner( FetchProfile );
