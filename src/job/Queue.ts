import { Job, jobRunner } from '@/abstract/Job';
import { ListQueue, ProfileQueue } from '@/core/Queue';
import { IJob } from '@/interfaces/job';
import { IQueue } from '@/interfaces/queue';
import { Parser } from '@/parser/Parser';

export class QueueJob extends Job implements IJob {

    constructor ( args: string[] ) {
        super( args, 'Queue' );
    }

    public async run () : Promise< void > {
        await this.protect( async () => {
            const { type, clear, add, prio, args } = this.args;

            let queue: IQueue;
            if ( type === 'profile' ) queue = ProfileQueue.getInstance();
            else if ( type === 'list' ) queue = ListQueue.getInstance();
            else throw new Error( `Unknown queue type: ${type}` );

            if ( Parser.boolean( clear ) ) queue.clear();
            else if ( add ) queue.addMany( Parser.string( add ).split( ',' ).filter( Boolean ).map(
                uriLike => ( {
                    uriLike, prio: Parser.strict( prio, 'number' ),
                    args: typeof args === 'string' ? JSON.parse( args ) : undefined
                } )
            ) );
        } );
    }

}

jobRunner( QueueJob );
