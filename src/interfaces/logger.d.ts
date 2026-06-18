export interface ILogger {
  error ( label: string, msg: string, err?: Error ) : void;
  errMsg ( label: string, err: unknown, msg?: string ) : void;
  exit ( label: string, msg: string, err?: Error ) : never;
  warn ( label: string, msg: string, meta?: unknown ) : void;
  info ( label: string, msg: string, meta?: unknown ) : void;
  debug ( label: string, msg: string, meta?: unknown ) : void;
  catch < F extends ( ...args: any[] ) => any, R = ReturnType< F > > (
    fn: F, label: string, msg: string, level: TLoggingLevel = 'error'
  ) : R | undefined;
  catchAsync < F extends ( ...args: any[] ) => Promise< any >, R = Awaited< ReturnType< F > > > (
    fn: F, label: string, msg: string, level: TLoggingLevel = 'error'
  ) : Promise< R | undefined >;
  getLogFile ( date: string ) : string | undefined;
  getCurrentLogFile () : string | undefined;
}
