import { ConfigLoader } from '@/core/ConfigLoader';
import { Fetch } from '@/core/Fetch';
import { TConfigObject } from '@/types/config';
import helper from '@/utils';

export abstract class Job {

    protected readonly silent: boolean;
    protected readonly safeMode: boolean;
    protected config: TConfigObject;
    protected fetch: Fetch;

    constructor ( silent: boolean, safeMode: boolean ) {
        this.silent = silent;
        this.safeMode = safeMode;
        this.config = ConfigLoader.getInstance();
        this.fetch = Fetch.getInstance();
    }

    public abstract run () : void | Promise< void >;

}

export function jobRunner< T extends typeof Job > (
    cls: T, method: keyof InstanceType< T > = 'run', ci: string = '--run',
    options: { silent: boolean, safeMode: boolean }, 
) : void {
    if ( ! process.argv.includes( ci ) ) return;
    const { silent = false, safeMode = false } = options;
    try {
        const job = new ( cls as any )( silent, safeMode );
        ( job[ method ] as Function )();
    } catch ( err ) {
        if ( ! silent ) helper.log.error( `Job failed: ${ ( err as Error ).message }`, err as Error );
        if ( ! safeMode ) throw err;
    }
}
