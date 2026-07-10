import type { TService } from '@rtbnext/schema/src/base/const';

import { Storage } from '@/core/Storage';
import type { IStatus } from '@/interface/status';
import type { TStatusLog, TStatusLogItem } from '@/type/status';


export class Status implements IStatus {
  private static readonly storage = Storage.getInstance();
  private static instance: IStatus;

  private readonly entries: TStatusLog;

  private constructor () {
    this.entries = this.loadLog();
  }

  // --- helper ---

  private loadLog () : TStatusLog {
    return Status.storage.readJSONL< TStatusLogItem >( 'jobs.jsonl' ) || [];
  }

  // --- log job status ---

  public log ( services: TService[], job: string, success: boolean, duration: number, err?: unknown ) : void {
    //
  }

  // --- instantiate ---

  public static getInstance () : IStatus {
    return Status.instance ??= new Status();
  }
}
