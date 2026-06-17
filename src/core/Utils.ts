export class Utils {
  public static date ( format: 'iso' | 'ymd' | 'ym' | 'y' = 'ymd' ) : string {
    const iso = new Date().toISOString();
    return format === 'iso' ? iso : iso.split( '-' ).slice( 0, format.length ).join( '-' );
  }
}
