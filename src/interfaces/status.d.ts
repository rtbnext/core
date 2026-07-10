import type { TService } from '@rtbnext/schema/src/base/const';


export interface IStatus {
  log ( services: TService[], job: string, success: boolean, duration: number, err?: unknown, save?: boolean ) : void;
  save ( entries?: TStatusLog ) : void;
}
