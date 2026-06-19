import { sha256 } from 'js-sha256';
import { join } from 'node:path';

import { Config } from '@/core/Config';
import { Storage } from '@/core/Storage';
import type { IQueue } from '@/interface/queue';
import type { TQueueConfig } from '@/type/config';
import type { TQueue, TQueueItem, TQueueStorage, TQueueType } from '@/type/queue';


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

  // --- helper ---

  protected loadQueue () : TQueue {
    return new Map( ( Queue.storage.readJSON< TQueueStorage >( this.path ) || [] ).map(
      ( i: TQueueItem ) => [ i.key, i ]
    ) );
  }

  protected saveQueue () : void {
    const { defaultPrio = 0 } = this.config;

    Queue.storage.writeJSON< TQueueStorage >( this.path,
      Array.from( this.queue.values() ).sort( ( a: TQueueItem, b: TQueueItem ) =>
        ( b.prio ?? defaultPrio ) - ( a.prio ?? defaultPrio ) || 
        ( new Date( a.ts ).getTime() - new Date( b.ts ).getTime() )
      )
    );
  }

  protected key ( uri: string, args?: unknown ) : string {
    return sha256( uri + JSON.stringify( args ) );
  }
}
