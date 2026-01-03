import { TQueueType } from '@/types/queue';

abstract class Queue {

    private readonly queueType: TQueueType;

    protected constructor ( type: TQueueType ) {
        this.queueType = type;
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
