import type { TQueueItem, TQueueOptions } from '@/type/queue';


export interface IQueue {
  readonly size: number;
  getQueue () : TQueueItem[];
  getByKey ( key: string ) : TQueueItem | undefined;
  hasKey ( key: string ) : boolean;
  getByUri ( uriLike: string ) : TQueueItem[];
  hasUri ( uriLike: string ) : boolean;
  clear () : void;
  add ( opt: TQueueOptions, save?: boolean ) : boolean;
  addMany ( items: TQueueOptions[] ) : number;
  removeByKey ( key: string ) : boolean;
  remove ( ...uriLike: string[] ) : number;
  next ( n: number = 1 ) : TQueueItem[];
  nextUri ( n: number = 1 ) : string[];
}
