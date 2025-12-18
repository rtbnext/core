export class Queue {

    private static instance: Queue;

    private constructor () {}

    public static getInstance () {
        return Queue.instance ||= new Queue();
    }

}
