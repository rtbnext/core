import type { TService } from '@rtbnext/schema/src/base/const';

import { Storage } from '@/core/Storage';


export class Status {
  private static readonly storage = Storage.getInstance();

  public log ( service: TService, job: string, success: boolean, duration: number, err?: unknown ) : void {}
}
