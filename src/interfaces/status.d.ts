import type { TService } from '@rtbnext/schema/src/base/const';


export interface IStatus {
  log ( groups: TService[], job: string, success: boolean, duration: number, err?: unknown ) : void;
}
