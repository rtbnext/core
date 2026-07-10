import type { TService } from '@rtbnext/schema/src/base/const';

import { Storage } from '@/core/Storage';


export class Status {
  private static readonly storage = Storage.getInstance();
  private static instance: Status;

  private constructor () {}

  public log ( service: TService, job: string, success: boolean, duration: number, err?: unknown ) : void {
    //
  }

  // --- instantiate ---

  public static getInstance () : Status {
    return Status.instance ??= new Status();
  }
}
