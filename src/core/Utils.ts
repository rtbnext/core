import type { TMetaData } from '@rtbnext/schema/src/base/generic';

export class Utils {
  public static date ( format: 'iso' | 'ymd' | 'ym' | 'y' = 'ymd' ) : string {
    const iso = new Date().toISOString();
    return format === 'iso' ? iso : iso.split( '-' ).slice( 0, format.length ).join( '-' );
  }

  public static metaData < T extends Record< string, any > > ( obj?: T ) : TMetaData {
    return { $metadata: { schemaVersion: 2, lastModified: Utils.date( 'iso' ), ...obj } };
  }
}
