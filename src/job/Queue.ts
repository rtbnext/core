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
            const { type, clear, add, remove, prio, args } = this.args;
            const queue: IQueue | undefined = type === 'profile' ? ProfileQueue.getInstance()
                : type === 'list' ? ListQueue.getInstance() : undefined;

            if ( ! queue ) throw new Error( `Unknown queue type: ${type}` );
            else if ( this.truthy( clear ) ) queue.clear();
            else if ( add ) queue.addMany( this.split( add ).map( uriLike => ( {
                uriLike, prio: Parser.strict( prio, 'number' ),
                args: typeof args === 'string' ? JSON.parse( args ) : undefined
            } ) ) );
            else if ( remove ) queue.remove( ...this.split( remove ) );
            else throw new Error( `No valid action provided for queue job` );
        } );
    }

}

jobRunner( QueueJob );
