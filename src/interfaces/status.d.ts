import type { TService } from '@rtbnext/schema/src/base/const';
import type { TStatus } from '@rtbnext/schema/src/model/status';


export interface IStatus {
  log ( services: TService[], job: string, success: boolean, duration: number, err?: unknown, save?: boolean ) : void;
  getStatus () : TStatus;
  save ( entries?: TStatusLog ) : void;
}
