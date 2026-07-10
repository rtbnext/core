import type { TService, TStatusFlag } from '@rtbnext/schema/src/base/const';
import type { TStatus } from '@rtbnext/schema/src/model/status';

import type { TStatusLog } from '@/type/status';


export interface IStatus {
  log ( services: TService[], job: string, success: boolean, duration: number, err?: unknown, save?: boolean ) : void;
  calculateStatus () : TStatus;
  getStatus () : TStatus | undefined;
  getServiceStatus ( service: TService ) : TStatusFlag;
  getOverallStatus () : TStatusFlag;
  flush ( entries?: TStatusLog ) : void;
}
