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

  private getServiceEntries ( service: TService ) : TStatusLog {
    return this.entries.filter( e => e.services.includes( service ) );
  }

  // --- log job status ---

  public log ( services: TService[], job: string, success: boolean, duration: number, err?: unknown, save: boolean = true ) : void {
    const entry: TStatusLogItem = { timestamp: new Date().toISOString(), services, job, success, duration };
    if ( err instanceof Error ) entry.errMsg = err.message;

    this.entries.push( entry );
    if ( save ) this.save( [ entry ] );
  }

  // --- save logs ---

  public save ( entries?: TStatusLog ) : void {
    if ( entries?.length ) Status.storage.appendJSONL< TStatusLogItem >( 'jobs.jsonl', entries );
    else Status.storage.writeJSONL< TStatusLogItem >( 'jobs.jsonl', this.entries );
  }

  // --- instantiate ---

  public static getInstance () : IStatus {
    return Status.instance ??= new Status();
  }
}
