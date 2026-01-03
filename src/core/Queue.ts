import { Config } from '@/core/Config';
import { Utils } from '@/core/Utils';
import { TQueueConfig } from '@/types/config';
import { TQueue, TQueueItem, TQueueType } from '@/types/queue';
import { sha256 } from 'js-sha256';

abstract class Queue {

    private readonly config: TQueueConfig;
    private readonly queueType: TQueueType;
    private queue: TQueue;

    protected constructor ( type: TQueueType ) {
        this.config = Config.getInstance().queue;
        this.queueType = type;
        this.queue = new Map();
    }

    private key ( uri: string, args?: any ) : string {
        return sha256( uri + JSON.stringify( args ) );
    }

    public getQueue () : TQueueItem[] {
        return Array.from( this.queue.values() );
    }

    public size () : number {
        return this.queue.size;
    }

    public getByKey ( key: string ) : TQueueItem | undefined {
        return this.queue.get( key );
    }

    public hasKey ( key: string ) : boolean {
        return this.queue.has( key );
    }

    public getByUri ( uriLike: string ) : TQueueItem[] {
        const uri = Utils.sanitize( uriLike );
        return [ ...this.queue.values() ].filter( i => i.uri === uri );
    }

    public hasUri ( uriLike: string ) : boolean {
        return this.getByUri( uriLike ).length !== 0;
    }

}

export class ProfileQueue extends Queue {

    private static instance: ProfileQueue;

    private constructor () {
        super( 'profile' );
    }

    public static getInstance () : ProfileQueue {
        return this.instance ||= new ProfileQueue();
    }

}

export class ListQueue extends Queue {

    private static instance: ListQueue;

    private constructor () {
        super( 'list' );
    }

    public static getInstance () : ListQueue {
        return this.instance ||= new ListQueue();
    }

}
