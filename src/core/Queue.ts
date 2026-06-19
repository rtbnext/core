import { join } from 'node:path';

import { Config } from '@/core/Config';
import { Storage } from '@/core/Storage';
import type { IQueue } from '@/interface/queue';
import type { TQueueConfig } from '@/type/config';
import type { TQueue, TQueueType } from '@/type/queue';


export abstract class Queue implements IQueue {
  protected static readonly storage = Storage.getInstance();

  protected readonly config: TQueueConfig;
  protected readonly type: TQueueType;
  protected readonly path: string;
  protected queue: TQueue;

  protected constructor ( type: TQueueType ) {
    const { root, queue } = Config.getInstance();
    this.config = queue;
    this.type = type;

    this.path = join( root, `queue/${ this.type }.json` );
    Queue.storage.ensurePath( this.path );

    this.queue = this.loadQueue();
  }
}
