import type { ILogger } from '@/interface/logger';


export class Logger implements ILogger {
  private static instance: Logger;

  // --- instantiate ---

  public static getInstance () : ILogger {
    return Logger.instance ||= new Logger();
  }
}
