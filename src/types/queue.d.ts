export type TQueueType = 'profile' | 'list';

export type TQueueOptions = {
  uriLike: string;
  args?: Record< string, unknown >;
  prio?: number;
};

export type TQueueItem = {
  readonly key: string;
  readonly uri: string;
  ts: string;
  args?: Record< string, unknown >;
  prio?: number;
};

export type TQueue = Map< string, TQueueItem >;

export type TQueueStorage = TQueueItem[];
