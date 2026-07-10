import type { TService, TStatusFlag } from '@rtbnext/schema/src/base/const';
import type { TStatus } from '@rtbnext/schema/src/model/status';

import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import type { IStatus } from '@/interface/status';
import { Services, StatusConfig } from '@/lib/const';
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

  private calculateOverallStatus ( statuses: TStatusFlag[] ) : TStatusFlag {
    if ( statuses.includes( 'outage' ) ) return 'outage';
    if ( statuses.includes( 'degraded' ) ) return 'degraded';
    if ( statuses.includes( 'maintenance' ) ) return 'maintenance';
    if ( statuses.includes( 'unknown' ) ) return 'unknown';
    return 'healthy';
  }

  public getStatus () : TStatus {
    const services = Object.fromEntries( Services.map( s => [ s, this.calculateServiceStatus( s ) ] ) ) as TStatus[ 'services' ];
    return { ...Utils.metaData(), services, status: this.calculateOverallStatus( Object.values( services ) ) };
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

    Status.storage.writeJSON< TStatus >( 'status.json', this.getStatus() );
  }

  // --- instantiate ---

  public static getInstance () : IStatus {
    return Status.instance ??= new Status();
  }
}
