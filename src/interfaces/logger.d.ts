export interface ILogger {
  error ( msg: string, err?: Error ) : void;
  errMsg ( err: unknown, msg?: string ) : void;
  exit ( msg: string, err?: Error ) : never;
  warn ( msg: string, meta?: unknown ) : void;
  info ( msg: string, meta?: unknown ) : void;
  debug ( msg: string, meta?: unknown ) : void;
  catch < F extends ( ...args: any[] ) => any, R = ReturnType< F > > (
    fn: F, msg: string, level: TLoggingLevel = 'error'
  ) : R | undefined;
  catchAsync < F extends ( ...args: any[] ) => Promise< any >, R = Awaited< ReturnType< F > > > (
    fn: F, msg: string, level: TLoggingLevel = 'error'
  ) : Promise< R | undefined >;
  getLogFile ( date: string ) : string | undefined;
  getCurrentLogFile () : string | undefined;
}
