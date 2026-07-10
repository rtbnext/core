import type { TService, TStatusFlag } from '@rtbnext/schema/src/base/const';

import { Storage } from '@/core/Storage';
import type { IStatus } from '@/interface/status';
import type { TStatusLog, TStatusLogItem } from '@/type/status';
import { StatusConfig } from '@/lib/const';


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

  // --- status calculation ---

  private calculateServiceStatus ( service: TService ) : TStatusFlag {
    const config = StatusConfig[ service ];
    const entries = this.getServiceEntries( service ).slice( -config.samples );

    if ( ! entries.length ) return 'unknown';

    const failed = entries.filter( e => ! e.success ).length;
    const ratio = failed / entries.length;

    if ( ratio >= config.outageThreshold ) return 'outage';
    if ( ratio >= config.degradedThreshold ) return 'degraded';
    return 'healthy';
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
