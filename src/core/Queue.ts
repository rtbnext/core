import { sha256 } from 'js-sha256';
import { join } from 'node:path';

import { Config } from '@/core/Config';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import type { IQueue } from '@/interface/queue';
import type { TQueueConfig } from '@/type/config';
import type { TQueue, TQueueItem, TQueueStorage, TQueueType } from '@/type/queue';
import { log } from './Logger';


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
    log.debug( `Load queue [${ this.type }]` );

    return new Map( ( Queue.storage.readJSON< TQueueStorage >( this.path ) || [] ).map(
      ( i: TQueueItem ) => [ i.key, i ]
    ) );
  }

  protected saveQueue () : void {
    const { defaultPrio = 0 } = this.config;

    Queue.storage.writeJSON< TQueueStorage >( this.path,
      [ ...this.queue.values() ].sort( ( a: TQueueItem, b: TQueueItem ) =>
        ( b.prio ?? defaultPrio ) - ( a.prio ?? defaultPrio ) || 
        ( new Date( a.ts ).getTime() - new Date( b.ts ).getTime() )
      )
    );
  }

  protected key ( uri: string, args?: unknown ) : string {
    return sha256( uri + JSON.stringify( args ) );
  }

  // --- basic operations ---

  public get size () : number {
    return this.queue.size;
  }

  public getQueue () : TQueueItem[] {
    return [ ...this.queue.values() ];
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

  public clear () : void {
    log.debug( `Clear queue [${ this.type }]` );

    this.queue.clear();
    this.saveQueue();
  }
}
