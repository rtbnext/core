import { Job, jobRunner } from '@/abstract/Job';
import { ProfileParser } from '@/collection/Profile';
import { TArgs } from '@/types/generic';

export class UpdateProfile extends Job {

    protected override readonly job = 'FetchProfile';

    public async run ( args: TArgs ) : Promise< void > {
        this.catch( async () => {
            const batch = 'profile' in args && typeof args.profile === 'string'
                ? args.profile.split( ',' ).filter( Boolean )
                : this.queue.nextUri( 'profile', this.config.fetch.rateLimit.maxBatchSize );

            for ( const row of await this.fetch.profile( ...batch ) ) {
                if ( ! row || ! row.success || ! row.data ) {
                    this.log( 'Request failed', row, 'warn' );
                    continue;
                }

                const parser = new ProfileParser( row.data );
                // create or update profile
            }
        } );
    }

}

jobRunner( UpdateProfile );
