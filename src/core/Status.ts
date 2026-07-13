import type { TService, TStatusFlag } from '@rtbnext/schema/src/base/const';
import type { TStatus } from '@rtbnext/schema/src/model/status';

import { Config } from '@/core/Config';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import type { IStatus } from '@/interface/status';
import { Services, StatusPolicy } from '@/lib/const';
import type { TStatusConfig } from '@/type/config';
import type { TStatusLog, TStatusLogItem } from '@/type/status';


export class Status implements IStatus {
  private static readonly storage = Storage.getInstance();
  private static instance: IStatus;

  private readonly path = 'system/status.json';
  private readonly logPath = 'system/jobs.jsonl';
  private readonly config: TStatusConfig;
  private readonly entries: TStatusLog;

  private constructor () {
    this.config = Config.getInstance().status;
    this.entries = this.loadLog();
  }

  // --- helper ---

  private loadLog () : TStatusLog {
    return Status.storage.readJSONL< TStatusLogItem >( this.logPath ) || [];
  }

  private getServiceEntries ( service: TService ) : TStatusLog {
    return this.entries.filter( e => e.services.includes( service ) );
  }

  // --- status calculation ---

  private calculateServiceStatus ( service: TService ) : TStatusFlag {
    if ( this.config?.maintenance?.includes( service ) ) return 'maintenance';

    const config = StatusPolicy[ service ];
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
    if ( statuses.every( s => s === 'unknown' ) ) return 'unknown';
    return 'healthy';
  }

  public calculateStatus () : TStatus {
    const services = Object.fromEntries( Services.map( s => [ s, this.calculateServiceStatus( s ) ] ) ) as TStatus[ 'services' ];
    return { ...Utils.metaData(), services, status: this.calculateOverallStatus( Object.values( services ) ) };
  }

  // --- getter ---

  public getStatus () : TStatus | undefined {
    return Status.storage.readJSON< TStatus >( this.path ) || undefined;
  }

  public getServiceStatus ( service: TService ) : TStatusFlag {
    return this.getStatus()?.services[ service ] ?? 'unknown';
  }

  public getOverallStatus () : TStatusFlag {
    return this.getStatus()?.status ?? 'unknown';
  }

  public getLog () : TStatusLog {
    return this.entries;
  }

  public getArchive ( month: string ) : TStatusLog {
    return Status.storage.readJSONL< TStatusLogItem >( `system/archive/${ month }.jsonl` ) || [];
  }

  // --- log job status ---

  public log ( services: TService[], job: string, success: boolean, duration: number, err?: unknown, save: boolean = true ) : void {
    const entry: TStatusLogItem = { timestamp: new Date().toISOString(), services, job, success, duration };
    if ( err instanceof Error ) entry.errMsg = err.message;

    this.entries.push( entry );
    if ( save ) this.flush( [ entry ] );
  }

  // --- save logs ---

  public flush ( entries?: TStatusLog ) : void {
    if ( entries?.length ) Status.storage.appendJSONL< TStatusLogItem >( this.logPath, entries );
    else Status.storage.writeJSONL< TStatusLogItem >( this.logPath, this.entries );

    Status.storage.writeJSON< TStatus >( this.path, this.calculateStatus() );
  }

  // --- clean up log ---

  public cleanup ( months: number = 3 ) : void {
    const th = new Date(); th.setMonth( th.getMonth() - months );
    const archive = new Map< string, TStatusLog >();

    const active = this.entries.filter( entry => {
      const date = new Date( entry.timestamp );
      if ( date >= th ) return true;

      const month = entry.timestamp.slice( 0, 7 );
      archive.set( month, [ ...( archive.get( month ) ?? [] ), entry ] );

      return false;
    } );

    for ( const [ month, entries ] of archive ) {
      const path = `system/archive/${ month }.jsonl`;
      const existing = Status.storage.readJSONL< TStatusLogItem >( path ) || [];
      const unique = [ ...new Map( [ ...existing, ...entries ].map(
        entry => [ JSON.stringify( entry ), entry ]
      ) ).values() ];

      Status.storage.writeJSONL< TStatusLogItem >( path, unique );
    }

    this.entries.splice( 0, this.entries.length, ...active );
    this.flush();
  }

  // --- instantiate ---

  public static getInstance () : IStatus {
    return Status.instance ??= new Status();
  }
}
