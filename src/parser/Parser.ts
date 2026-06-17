import { REGEX_SPACES } from '@/lib/regex';

export class Parser {
  public static string ( value: any ) : string {
    return String( value ).trim().replace( REGEX_SPACES, ' ' );
  }
}
