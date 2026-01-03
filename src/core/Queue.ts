import { TQueueConfig } from '@/types/config';
import { TQueue, TQueueType } from '@/types/queue';
import { Config } from './Config';

abstract class Queue {

    private static readonly config: TQueueConfig = Config.getInstance().queue;

    private readonly queueType: TQueueType;
    private queue: TQueue;

    protected constructor ( type: TQueueType ) {
        this.queueType = type;
        this.queue = new Map();
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
