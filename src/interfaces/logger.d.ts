export interface ILogger {
  error ( label: string, msg: string, err?: Error ) : void;
  errMsg ( label: string, err: unknown, msg?: string ) : void;
  exit ( label: string, msg: string, err?: Error ) : never;
  warn ( label: string, msg: string, meta?: unknown ) : void;
  info ( label: string, msg: string, meta?: unknown ) : void;
  debug ( label: string, msg: string, meta?: unknown ) : void;
}
